import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { getSubscriptionInvoiceById,downloadInvoice,exportEmptyData } from '../../Actions/Settings/settingsActions.js';
import { numberFormat } from '../../Utils/services.js';
import { ToastContainer, toast } from "react-toastify";
import { showFormattedDate} from '../../Utils/services.js';

const specifiedFormat = "MMMM DD, YYYY";
class InvoiceView extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState;
  }

  get initialState() {
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    return {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      showLoader:false,
      invoiceId: (this.props.match.params.invoiceId !== null && this.props.match.params.invoiceId !== '' && this.props.match.params.invoiceId) ? this.props.match.params.invoiceId : 0,
      invoiceData:{},
      invoiceInfo:{},
      invoiceTo:[],
      invoiceEmail:'',
      invoiceAddress:[]
    };
  }

  componentDidMount() {
    this.setState({ 'showLoader': true })
    this.props.getSubscriptionInvoiceById(this.state.invoiceId);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.invoiceData !== undefined && nextProps.invoiceData.status === 200 && nextProps.data !== prevState.invoiceData) {
      returnState.invoiceData =  nextProps.invoiceData.data;
      returnState.invoiceInfo =  nextProps.invoiceData.data.invoice_data;
      returnState.showLoader =  false;
      let invoiceTo = [];
      let invoiceEmail = '';
      let invoiceAddress = [];
      if(returnState.invoiceInfo.account){
        if(returnState.invoiceInfo.account.name){
          invoiceTo.push(returnState.invoiceInfo.account.name);
        }
        if(returnState.invoiceInfo.account.admin){
          invoiceTo.push(returnState.invoiceInfo.account.admin.firstname+" "+returnState.invoiceInfo.account.admin.lastname);
          invoiceEmail = returnState.invoiceInfo.account.admin.email_id;
          let addressLine = [];
          if(returnState.invoiceInfo.account.admin.address_line_1){
              addressLine.push(returnState.invoiceInfo.account.admin.address_line_1);
          }
          if(returnState.invoiceInfo.account.admin.address_line_2){
              addressLine.push(returnState.invoiceInfo.account.admin.address_line_2);
          }
          if(returnState.invoiceInfo.account.admin.address_line_3){
              addressLine.push(returnState.invoiceInfo.account.admin.address_line_3);
          }
          if(returnState.invoiceInfo.account.admin.address_line_4){
              addressLine.push(returnState.invoiceInfo.account.admin.address_line_4);
          }
          addressLine = addressLine.join(' ');
          if(addressLine){
            invoiceAddress.push(addressLine);
          }
          if(returnState.invoiceInfo.account.admin.city){
              invoiceAddress.push(returnState.invoiceInfo.account.admin.city);
          }
          if(returnState.invoiceInfo.account.admin.state){
              invoiceAddress.push(returnState.invoiceInfo.account.admin.state);
          }
          if(returnState.invoiceInfo.account.admin.country){
              invoiceAddress.push(returnState.invoiceInfo.account.admin.country);
          }
        }
      }
      returnState.invoiceTo = invoiceTo;
      returnState.invoiceEmail = invoiceEmail;
      returnState.invoiceAddress = invoiceAddress;
      nextProps.exportEmptyData();
    } else if(nextProps.showLoader != undefined && nextProps.showLoader == false){
      returnState.showLoader = false;
      nextProps.exportEmptyData();
    } else if (nextProps.invoiceFilePath != undefined && nextProps.invoiceFilePath !== null){
      nextProps.exportEmptyData();
      returnState.showLoader = false;
      window.open(nextProps.invoiceFilePath)
    }

    return returnState
  }

  downloadInvoice = () => {
    this.setState({showLoader:true})
    this.props.downloadInvoice(this.state.invoiceId)
  }


  render() {
    let returnUrl = '';

    if (this.state.roomType && this.state.roomType === 'clients') {
      returnUrl = (this.props.match.params.type) ? "/" + this.state.roomType + "/" + this.props.match.params.type + "/" + this.props.match.params.patientID : "/" + this.state.roomType
    } else {
      returnUrl = '/settings/manage-invoices'
    }

    let notesClass = "settings-subtitle m-b-20 no-display";
    return (
      <div id="content">
        <div className="wide-popup">
          <div className="modal-blue-header">
            <Link to={returnUrl} className="popup-cross">×</Link>
            {this.state.showLoader === false && <span className="popup-blue-name">{this.state.settingsLang.billing_view_invoice}</span>}
            <div className="popup-btns">
              <a className="line-btn popup-header-btn" onClick={this.downloadInvoice}>{this.state.settingsLang.billing_download_invoice}</a>
            </div>
          </div>

          <div className="wide-popup-wrapper time-line">
            <center>
              <table id="print_area" border={0} cellPadding={0} cellSpacing={0} height="100%" width="100%" style={{maxWidth: '700px'}}>
                <tbody>
                  <tr>
                    <td align="center" valign="top">
                      <table border={0} cellPadding={0} cellSpacing={0} width="100%">
                        <tbody>
                          <tr>
                            <td valign="top">
                              <table border={0} cellPadding={5} cellSpacing={0} width="100%">
                                <tbody>
                                  <tr>
                                    <td valign="top" width={400}>
                                      <div style={{padding: '5px 0px'}}>
                                        <img src={this.state.invoiceData.account_logo_path ? this.state.invoiceData.account_logo_path : "/images/logo.png"} style={{height: '70px'}} />
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table border={0} cellPadding={0} cellSpacing={0} width="100%">
                        <tbody>
                          <tr>
                            <td align="center" valign="top">
                              <table border={0} cellPadding={0} cellSpacing={0} width="100%">
                                <tbody>
                                  <tr>
                                    <td colSpan={3} valign="top">
                                      <table border={0} cellPadding={10} cellSpacing={0} width="100%">
                                        <tbody>
                                          <tr>
                                            <td valign="top">
                                              <div style={{fontSize: '14px', color: '#000000', padding: '10px 0px 3px'}}>
                                                {this.state.settingsLang.billing_invoice_to}</div>
                                              <div style={{fontSize: '14px', color: '#777777', fontWeight: 400}}>
                                                { this.state.invoiceTo.length >1 ?
                                                  this.state.invoiceTo.map((obj,idx) =>{
                                                    return (<div key={'invoice-to'+idx}>{obj}</div>)
                                                  })
                                                  :
                                                  this.state.invoiceTo
                                                }
                                              </div>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td valign="top" width={400}>
                                              <div style={{fontSize: '14px', color: '#000000', padding: '10px 0px 3px'}}>
                                                {this.state.settingsLang.Survey_email}</div>
                                              <div style={{fontSize: '14px', color: '#777777', fontWeight: 400}}>
                                                {this.state.invoiceEmail}
                                              </div>
                                              <div style={{fontSize: '14px', color: '#000000', padding: '10px 0px 3px'}}>
                                                {this.state.settingsLang.clinics_Address}</div>
                                              <div style={{fontSize: '14px', color: '#777777', fontWeight: 400}}>
                                                { this.state.invoiceAddress.length >1 ?
                                                  this.state.invoiceAddress.map((obj,idx) =>{
                                                    return (<div key={'invoice-address'+idx}>{obj}{((idx + 1) != this.state.invoiceAddress.length) ? ',' : null}</div>)
                                                  })
                                                  :
                                                  this.state.invoiceAddress
                                                }
                                              </div>
                                            </td>
                                            <td valign="bottom" width={400} align="right">
                                              <table width={250} style={{float: 'right', fontSize: '14px', padding: '10px 0px'}}>
                                                <tbody>
                                                  <tr>
                                                    <td align="left">{this.state.settingsLang.billing_invoice_no}:</td>
                                                    <td style={{color: '#777777', textAlign: 'right'}}>{this.state.invoiceInfo.invoice_number}</td>
                                                  </tr>
                                                  <tr>
                                                    <td align="left">{this.state.settingsLang.billing_invoice_date}:</td>
                                                    <td style={{color: '#777777', textAlign: 'right'}}>{this.state.invoiceInfo.created ? showFormattedDate(this.state.invoiceInfo.created,false,specifiedFormat) : ''}</td>
                                                  </tr>
                                                  { (this.state.invoiceInfo.payment_status == 'paid') &&
                                                    <tr>
                                                      <td align="left">
                                                        {this.state.settingsLang.billing_payment_on}:
                                                      </td>
                                                      <td style={{color: '#777777', textAlign: 'right'}}>{this.state.invoiceInfo.modified ? showFormattedDate(this.state.invoiceInfo.modified,false,specifiedFormat) : ''}</td>
                                                    </tr>
                                                  }

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
                          { (this.state.invoiceInfo.invoice_number !== undefined) &&
                            <tr>
                              <td colSpan={3} valign="top">
                                <table border={0} cellPadding={10} cellSpacing={0} width="100%" style={{marginTop: '25px'}}>
                                  <tbody>
                                    <tr>
                                      <td style={{borderBottom: '1px solid #dddddd'}}>
                                        <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', padding: '10px 0px'}}>
                                          {this.state.settingsLang.billing_item_description}</div>
                                      </td>
                                      <td style={{borderBottom: '1px solid #dddddd'}} align="right">
                                        <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', textAlign: 'right', padding: '10px 0px'}}>
                                          {this.state.globalLang.label_amount}</div>
                                      </td>
                                    </tr>
                                    {
                                      (this.state.invoiceInfo.recurly_invoice_id != 0 || this.state.invoiceInfo.invoice_type == 'dispute_fee') ?
                                        <tr>
                                          <td style={{borderBottom: '1px solid #dddddd'}}>
                                            <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>
                                              {this.state.invoiceInfo.recurly_invoice_description}</div>
                                          </td>
                                          <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                            <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>
                                              {numberFormat(this.state.invoiceInfo.invoice_amount,'currency',2)}</div>
                                          </td>
                                        </tr>
                                      :
                                      this.state.invoiceInfo.subscription_invoice_item.map((obj,idx)=>{
                                        const descriptionData = obj[Object.keys(obj)[0]];
                                        return (
                                          <tr key={'payment-description-'+idx}>
                                            <td style={{borderBottom: '1px solid #dddddd'}}>
                                              <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>
                                              {descriptionData.description}</div>
                                            </td>
                                            <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                              <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>
                                                {numberFormat(descriptionData.amount,'currency',2)}</div>
                                            </td>
                                          </tr>
                                        )
                                      })
                                    }
                                  </tbody>
                                </table>
                                { (this.state.invoiceInfo.payment_status == 'paid') &&
                                  <table border={0} cellPadding={10} cellSpacing={0} width="100%" style={{marginTop: '25px'}}>
                                    <tbody>
                                      <tr>
                                        <td style={{borderBottom: '1px solid #dddddd'}}>
                                          <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', padding: '10px 0px'}}>
                                            {this.state.settingsLang.billing_payment_details}</div>
                                        </td>
                                        <td style={{borderBottom: '1px solid #dddddd'}} align="right">
                                          <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', textAlign: 'right', padding: '10px 0px'}}>
                                            {this.state.globalLang.label_amount}</div>
                                        </td>
                                      </tr>
                                      {
                                        (this.state.invoiceInfo.recurly_invoice_id != 0 ) &&
                                        <tr>
                                          <td style={{borderBottom: '1px solid #dddddd'}}>
                                            <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>&nbsp;</div>
                                          </td>
                                          <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                            <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>
                                              {numberFormat(this.state.invoiceData.total_amount,'currency',2)}</div>
                                          </td>
                                        </tr>
                                      }
                                      {(this.state.invoiceData.amount_from_card > 0 || this.state.invoiceData.credit_adjusted_amount > 0)  &&
                                        (this.state.invoiceInfo.recurly_invoice_id == 0  && this.state.invoiceData.show_credit_card) &&
                                        <tr>
                                          <td style={{borderBottom: '1px solid #dddddd'}}>
                                            <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>
                                              {this.state.invoiceData.card_details}</div>
                                          </td>
                                          <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                            <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>
                                              {numberFormat(this.state.invoiceData.amount_from_card,'currency',2)}</div>
                                          </td>
                                        </tr>
                                      }
                                      {(this.state.invoiceData.amount_from_card > 0 || this.state.invoiceData.credit_adjusted_amount > 0)  &&
                                        (this.state.invoiceInfo.recurly_invoice_id == 0 && this.state.invoiceData.credit_adjusted_status) &&
                                        <tr>
                                          <td style={{borderBottom: '1px solid #dddddd'}}>
                                            <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>
                                              {this.state.invoiceData.credit_adjusted_string}</div>
                                          </td>
                                          <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                            <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>
                                              {numberFormat(this.state.invoiceData.credit_adjusted_amount,'currency',2)}</div>
                                          </td>
                                        </tr>
                                      }
                                      {(this.state.invoiceData.amount_from_card <= 0 && this.state.invoiceData.credit_adjusted_amount <= 0)  &&
                                        <tr>
                                          <td style={{borderBottom: '1px solid #dddddd'}}>
                                            <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>
                                              {this.state.invoiceData.card_details}</div>
                                          </td>
                                          <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                            <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>
                                              {numberFormat(this.state.invoiceData.invoice_amount,'currency',2)}</div>
                                          </td>
                                        </tr>
                                      }
                                    </tbody>
                                  </table>
                                }
                                { (this.state.invoiceInfo.payment_status == 'paid' && this.state.invoiceInfo.recurly_invoice_id == 0  && this.state.invoiceData.show_credit_card && this.state.invoiceData.credit_adjusted_status) &&
                                  <table border={0} cellPadding={10} cellSpacing={0} width="100%" style={{marginTop: '25px'}}>
                                    <tbody>
                                      <tr>
                                        <td >
                                          <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', padding: '10px 0px'}}>
                                            {this.state.globalLang.label_amount}</div>
                                        </td>
                                        <td align="right">
                                          <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', textAlign: 'right', padding: '10px 0px'}}>
                                            {numberFormat(this.state.invoiceData.total_amount,'currency',2)}</div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                }
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                      <br />
                    </td>
                  </tr>
                </tbody>
              </table>
            </center>

          </div>
          <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
            <div className="loader-outer">
              <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
              <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.Please_Wait}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if (state.SettingReducer.action === "SUBSCRIPTION_INVOICE_DATA") {
    if(state.SettingReducer.data.status != 200) {
      toast.dismiss()
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.invoiceData = state.SettingReducer.data
    }
  } else if (state.SettingReducer.action === "DOWNLOAD_INVOICE") {
    if (state.SettingReducer.data.status != 200) {
      toast.dismiss()
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.invoiceFilePath = state.SettingReducer.data.data;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getSubscriptionInvoiceById: getSubscriptionInvoiceById,
    downloadInvoice:downloadInvoice,
    exportEmptyData:exportEmptyData
   }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(InvoiceView));
