import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import calRight from '../../images/cal-right.png';
import picClose from '../../images/popupClose.png';
import popupClose from '../../images/cross-input.png';
import CustomDatePicker from '../Common/CustomDatePicker.js';
import { getDateFormat, dateFormatPicker, capitalizeFirstLetter, numberFormat, displayName } from '../../Utils/services.js';
import moment from 'moment';
import defUserImage from '../../images/user.png';

class TreatmentPlan extends Component {
  constructor(props) {
    super(props);

    this.state = {

    };
  }

  componentDidMount() {
    const datePicker1=document.getElementsByClassName("react-datepicker__input-container")[0];
    datePicker1.childNodes[0].setAttribute("readOnly", true);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.parentState && nextProps.parentState !== prevState.parentState) {
      return {
        parentState : nextProps.parentState,
      }
    }
    return null;
  }

  render() {
    let expireAfterOptData = [];

    for (let i = 3; i <= 24; i++) {
      expireAfterOptData.push(<option key={i} value={i}>{i + ' months'}</option>);
    }

    if ( this.state.parentState.treatType === 'payg' ) {
      expireAfterOptData.push(<option key={'payg_0'} value={0}>{'Never'}</option>);
    }

    let userImage = (this.state.parentState.clientData && this.state.parentState.clientData.current_treatment_plan && this.state.parentState.clientData.current_treatment_plan.user && this.state.parentState.clientData.current_treatment_plan.user.user_image_url) ? this.state.parentState.clientData.current_treatment_plan.user.user_image_url : defUserImage;

    let totalProAmount = 0;
    return (
        <div>

        {<div className={(this.state.parentState.showSaveTemplate === true) ? 'blackOverlay' : 'blackOverlay no-display'}>
          <div className="vert-middle">
            <div className="loyaltyMembership ">
              <div className="newPopupTitle">Save as a template<a className="popupClose"><img onClick={this.props.hideChildTemplateNamePopup} src={picClose}/></a></div>
              <form onSubmit={this.props.handleChildTempNameSubmit}>
                <div className="newPopupContent">
                  <div className="row product-row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <div className="simpleField">
                        <div className="simpleLabel">Template name<span className="required">*</span></div>
                        <input className={this.state.parentState.templateNameClass} placeholder="Enter template name" name="templateName" onChange={this.props.handleChildChange} value={this.state.parentState.templateName}/>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4 col-xs-12 pull-right"><input type="submit" className="simple-btn pull-right" value="Save" /></div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>}


        {<div className={(this.state.parentState.showChangePlanCCPopup === true) ? 'blackOverlay' : 'blackOverlay no-display'}>
          <div className="vert-middle">
            <div className="loyaltyMembership start-program-main">
              <div className="newPopupTitle">Add New Card <a className="popupClose"><img onClick={this.props.hideChildChangePlanCCPopup} src={picClose}/></a></div>
              <form onSubmit={this.props.handleChildChangeCard}>
                <div className="newPopupContent">
                  <div className="row product-row">
                    <div className="col-md-7 col-sm-6 col-xs-12">
                      <div className="simpleField">
                        <div className="simpleLabel">Credit card number <span className="required">*</span></div>
                        <div className="simpleInput" id="treat-change-card-number"></div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-3 col-xs-6">
                      <div className="simpleField">
                        <div className="simpleLabel">Expiry date <span className="required">*</span></div>
                        <div className="simpleInput" id="treat-change-card-expiry"></div>
                      </div>
                    </div>
                    <div className="col-md-2 col-sm-3 col-xs-6">
                      <div className="simpleField">
                        <div className="simpleLabel">CVC <span className="required">*</span></div>
                        <div className="simpleInput" id="treat-change-card-cvc"></div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4 col-xs-12 pull-right">
                      <input type="submit" className="simple-btn pull-right" value="Save" />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>}



            <div className={(this.state.parentState.showStartProgram === true) ? 'blackOverlay' : 'blackOverlay no-display'}>
              <div className="vert-middle">
                <div className="loyaltyMembership start-program-main">
                  <div className="newPopupTitle">Start Program <a onClick={this.props.hideChildStartProgram} className="popupClose"><img src={picClose} /></a></div>
                    <form onSubmit={this.props.handleChildProgramSubmit}>
                      <div className="newPopupContent">
                        <div className="row m-b-15">
                          <div className="col-xs-12">
                            <div className="simpleField m-b-0">
                              <div className="simpleLabel">Clinic</div>
                              <select data-message="Are you sure you want to change location? We will recalculate treatment plan amount as per price of products for the new location." data-mtype={this.state.parentState.planClinic} data-action="changePlanClinic" type="text" className="simpleSelect" name="planClinic" onChange={this.props.handleChildChange} value={this.state.parentState.planClinic}>
                                {this.state.parentState.proClinicOptData}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-xs-12">
                          <div className="radio-outer">
                            {(this.state.parentState.showNewCardInput) && <span><input type="radio" name="cardType" id="saved" value="saved" checked={this.state.parentState.cardType === 'saved'} onChange={this.props.handleChildChange}/>
                            <label htmlFor="saved">Card On File</label></span>}
                            <input type="radio" name="cardType" id="new" value="new" checked={this.state.parentState.cardType === 'new'} onChange={this.props.handleChildChange}/>
                            <label htmlFor="new">New Card</label>
                          </div>
                          </div>
                        </div>

                        <div className={this.state.parentState.cardType === 'new' ? "row product-row" : "row product-row no-display"}>
                          <div className="col-md-7 col-sm-6 col-xs-12">
                            <div className="simpleField">
                              <div className="simpleLabel">Credit card number <span className="required">*</span></div>
                              <div className="simpleInput" id="treat-start-card-number"></div>
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-6">
                            <div className="simpleField">
                              <div className="simpleLabel">Expiry date <span className="required">*</span></div>
                              <div className="simpleInput" id="treat-start-card-expiry"></div>
                            </div>
                          </div>
                          <div className="col-md-2 col-sm-3 col-xs-6">
                            <div className="simpleField">
                              <div className="simpleLabel">CVC <span className="required">*</span></div>
                              <div className="simpleInput" id="treat-start-card-cvc"></div>
                            </div>
                          </div>
                        </div>

                        {(this.state.parentState.showNewCardInput) && <div className={this.state.parentState.cardType === 'saved' ? "row m-b-15" : "row m-b-15 no-display"}>
                          <div className="col-xs-12">
                            <div className="simpleField m-b-0">
                              <div className="simpleInput saveed-card">{(this.state.parentState.programDetails && this.state.parentState.programDetails.credit_card_details && this.state.parentState.cardNumberArray.length > 0) ? <span><b>{this.state.parentState.cardNumberArray[0]}</b> {`ending`} {this.state.parentState.cardNumberArray[1]}</span>  : ''}</div>
                            </div>
                          </div>
                        </div>}

                        {(this.state.parentState.programDetails && this.state.parentState.programDetails.treatMentPlan && this.state.parentState.programDetails.treatMentPlan.plan_type === 'payg') && <div className="row">
                          <div className="col-xs-12">
                            <div className="radio-outer m-b-0">
                              <div className="pull-left">
                                <input type="radio" name="chargeType" id="later" value="later" checked={this.state.parentState.chargeType === 'later'} onChange={this.props.handleChildChange}/>
                                <label htmlFor="later">Charge On Start Date</label>
                              </div>
                              <div className="pull-left">
                                <input type="radio" name="chargeType" id="now" value="now" checked={this.state.parentState.chargeType === 'now'} onChange={this.props.handleChildChange}/>
                                <label htmlFor="now">Charge Now</label>
                              </div>
                            </div>
                          </div>
                        </div>}
                        {(this.state.parentState.programDetails && this.state.parentState.programDetails.treatMentPlan && this.state.parentState.programDetails.treatMentPlan.plan_type === 'monthly') && <div className="checkbox-text m-t-10"><input className="new-check" type="checkbox" name="canExpireProduct" id="canExpireProduct" value={this.state.parentState.canExpireProduct} onChange={this.props.handleChildChange} checked={this.state.parentState.canExpireProduct}/> <label htmlFor="canExpireProduct" className="expireCheck">Expire product at the end of the month</label></div>}

                        <div className="row">
                          <div className="col-sm-6 col-xs-12">
                            <div className="treat-text m-b-10">Total <a onClick={() => this.props.viewChildBreakDown()} title="View detailed breakdown of this amount" className="help-icon sm-help">?</a></div>
                            <div className="TP-total">{numberFormat(this.state.parentState.startProTotal, 'currency')}</div>
                          </div>
                          {(this.state.parentState.programDetails && this.state.parentState.programDetails.treatMentPlan && this.state.parentState.programDetails.treatMentPlan.plan_type === 'monthly') && <div className="col-sm-6 col-xs-12 text-right perMonthValue">
                            <div className="treat-text m-b-10">Per Month</div>
                            <div className="TP-total">{numberFormat(this.state.parentState.startProMonthly, 'currency')}</div>
                          </div>}
                        </div>

                        <div className="row">
                          <div className="col-sm-8 col-xs-12">

                            <div className="pull-left">
                              <div className="treat-text m-b-10">Tax</div>
                              <div className={this.state.parentState.taxOuterClass}>
                                <input type="text" placeholder={`Tax`} name="taxAmount" value={this.state.parentState.taxAmount} onChange={this.props.handleChildChange} />
                                <span className="TP-discount-type">%</span>
                              </div>
                            </div>

                            <div className="pull-right">
                              <div className="treat-text m-b-10">Discount</div>
                              <div className={this.state.parentState.discountOuterClass}>
                                <input type="text" placeholder={`Amount`} name="discountValue" value={this.state.parentState.discountValue} onChange={this.props.handleChildChange} />
                                <span onClick={() => this.props.changeChildDiscType('percentage')} className={(this.state.parentState.discountType === 'percentage') ? "TP-discount-type active" : "TP-discount-type"}>%</span>
                                {(this.state.parentState.programDetails && this.state.parentState.programDetails.treatMentPlan && this.state.parentState.programDetails.treatMentPlan.plan_type === 'monthly') && <span onClick={() => this.props.changeChildDiscType('dollar')} className={(this.state.parentState.discountType === 'dollar') ? "TP-discount-type active" : "TP-discount-type"}>$</span>}
                                <a className="TP-discount-apply" onClick={this.props.applyChildProgramDiscount}>Apply</a>
                              </div>
                            </div>
                          </div>

                          <div className="col-sm-4 col-xs-12">
                              <button type="submit" className="simple-btn full-width strt-prog-btn m-t-30"><i className="fas fa-caret-right" /> Start Program</button>
                          </div>
                        </div>
                      </div>
                    </form>
                </div>
              </div>
            </div>


            <div className={(this.state.parentState.showPreviewDetails === true && this.state.parentState.showLoader === false && this.state.parentState.clientData && this.state.parentState.clientData.current_treatment_plan) ? 'blackOverlay' : 'blackOverlay no-display'}>
              <div className="vert-middle">
                  <div className="loyaltyMembership">
                      <div className="newPopupTitle">{(this.state.parentState.clientData && this.state.parentState.clientData.current_treatment_plan && this.state.parentState.clientData.current_treatment_plan.plan_type === 'monthly') ? 'Monthly' : 'Pay As You Go'} Treatment Plan
                          <a onClick={this.props.hideChildPreviewDetails} className="popupClose"><img src={picClose} /></a>
                      </div>
                      <div className="newPopupContent">
                          <p className="treat-plan-user">
                              <span className="user-profile-img" style={{backgroundImage: `url(${userImage})`}}> </span> by {(this.state.parentState.clientData.current_treatment_plan && this.state.parentState.clientData.current_treatment_plan && this.state.parentState.clientData.current_treatment_plan.user) && displayName(this.state.parentState.clientData.current_treatment_plan.user)}, {(this.state.parentState.clientData && this.state.parentState.clientData.current_treatment_plan && this.state.parentState.clientData.current_treatment_plan.clinic) &&  this.state.parentState.clientData.current_treatment_plan.clinic.clinic_name}
                          </p>
                          <div className="newPopupSubTitle pick-template m-b-10">Prescribed Treatment Plan</div>
                          {
                            (this.state.parentState.clientData && this.state.parentState.clientData.current_treatment_plan && this.state.parentState.clientData.current_treatment_plan.plan_type === 'payg' && this.state.parentState.clientData.current_treatment_plan.pay_as_you_go && this.state.parentState.clientData.current_treatment_plan.pay_as_you_go.length > 0) && this.state.parentState.clientData.current_treatment_plan.pay_as_you_go.map((obj, idx) => {
                              return (
                                <p key={idx} className="treat-text m-b-10"><b>{obj.product_name}</b>: {obj.units} units (Every {obj.repeat_val} {obj.repeat_by})</p>
                              )
                            })
                          }

                          {
                            (this.state.parentState.clientData && this.state.parentState.clientData.current_treatment_plan && this.state.parentState.clientData.current_treatment_plan.plan_type === 'monthly' && this.state.parentState.clientData.current_treatment_plan.patient_treatment_plan_schedule && this.state.parentState.clientData.current_treatment_plan.patient_treatment_plan_schedule.length > 0) && this.state.parentState.clientData.current_treatment_plan.patient_treatment_plan_schedule.map((obj, idx) => {
                              let date  = parseInt(obj.year) + '/' + obj.month + '/' + 1;
                              date      = moment(date).format('MMMM, YYYY');
                              return (
                                <p key={idx} className="treat-text m-b-10"><b>{obj.product.product_name}</b>: {obj.units} units ({date})</p>
                              )
                            })
                          }
                          <div className="row m-t-30">
                              <div className="col-sm-6 col-xs-12">
                                  <div className="treat-text m-b-10">Total <a onClick={() => this.props.viewChildBreakDown()} title="View detailed breakdown of this amount" className="help-icon sm-help">?</a></div>
                                  <div className="TP-total">{(this.state.parentState.clientData && this.state.parentState.clientData.current_treatment_plan) && numberFormat(this.state.parentState.clientData.current_treatment_plan.total_amount, 'currency')}</div>
                              </div>
                          </div>
                          <div className="row m-t-20">
                              <div className="col-sm-6 col-xs-12">
                                  <a onClick={this.props.makeChildPrescribeOnly} className="simple-btn create-treat-plan-btn">Prescribe only</a>
                              </div>
                              <div className="col-sm-6 col-xs-12">
                                  <a onClick={this.props.showChildProgramDetails} className="simple-btn create-treat-plan-btn">Start program</a>
                              </div>
                          </div>
                          <a onClick={this.props.showChildTemplateNamePopup} className="save-TP">Save created treatment plan as a template</a>
                      </div>
                  </div>
                </div>
              </div>

            <div className={(this.state.parentState.showTemplateConfirmation === true ) ? 'overlay' : ''}></div>
            <div id="filterModal" role="dialog" className={(this.state.parentState.showTemplateConfirmation === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" onClick={this.props.dismissUseModal}>×</button>
                    <h4 className="modal-title">Confirmation required!</h4>
                  </div>
                  <div className="modal-body add-patient-form filter-patient">
                      Are you sure you want to use this template?
                  </div>
                  <div className="modal-footer" >
                    <div className="col-md-12 text-left">
                      <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.props.dismissUseModal}>No</button>
                      <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={(e) => this.props.selectThisTemplate()}>Yes</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {<div className={(this.state.parentState.showPriceBreakModal === true) ? 'blackOverlay' : 'blackOverlay no-display'}>
              <div className="vert-middle">
                <div className="loyaltyMembership start-program-main">
                  <div className="newPopupTitle">Price Breakdown <a onClick={this.props.hideChildBreakDown} className="popupClose"><img src={picClose} /></a></div>
                  <div className="row m-b-0" />
                  <div className="table-responsive fixed-header-table">
                    <table className="table-updated juvly-table no-hover table-min-width table-fixed">
                      <thead className="table-updated-thead">
                        <tr>
                          <th className="col-xs-7 table-updated-th">DESCRIPTION</th>
                          <th className="col-xs-2 table-updated-th">PRICE/UNIT</th>
                          <th className="col-xs-3 table-updated-th text-right">AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody className="ajax_body">
                        {(this.state.parentState.priceBreakUpData && this.state.parentState.priceBreakUpData.length > 0) && this.state.parentState.priceBreakUpData.map((obj, idx) => {
                          let amount      = obj.price_per_unit * obj.units;
                          let proName     = (obj.product) ? obj.product.product_name : '';
                          let proText     = obj.units + ` units of ` + proName;
                          totalProAmount += obj.units * obj.price_per_unit;

                          return (
                            <tr key={idx} className="table-updated-tr">
                              <td className="col-xs-7 table-updated-td">{proText}</td>
                              <td className="col-xs-2 table-updated-td text-right">{numberFormat(obj.price_per_unit, 'currency')}</td>
                              <td className="col-xs-3 table-updated-td text-right">{numberFormat(amount, 'currency')}</td>
                            </tr>
                          )
                        })}
                        <tr key={`pro_total`} className="table-updated-tr">
                          <td colSpan="2" className="col-xs-9 table-updated-td"><b>Total</b></td>
                          <td className="col-xs-3 table-updated-td text-right">{numberFormat(totalProAmount, 'currency')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>}

          {<div className={(this.state.parentState.showTreatmentModal === true) ? "blackOverlay" : "blackOverlay no-display"}>
              <div className="vert-middle">
                <div className="loyaltyMembership">
                  <div className="newPopupTitle">Treatment Plan<a onClick={() => this.props.closeTratmentModal()} className="popupClose"><img src={picClose} /></a></div>
                  <div className="newPopupContent">
                    <a onClick={() => this.props.createNewTreatmentPlan()} className="simple-btn create-treat-plan-btn">Create New Treatment Plan</a>
                    {(this.state.parentState.templatesData) && <div>
                      <div className="newPopupSubTitle pick-template">Or pick a template</div>
                      <div className="treatment-table">
                        <div className="treatment-tr treatHeader">
                          <div className="treatment-td col-xs-7">Template Name</div>
                          <div className="treatment-td col-xs-5">Template Type</div>
                        </div>

                        {
                          (this.state.parentState.templatesData && this.state.parentState.templatesData.length > 0) && this.state.parentState.templatesData.map((obj, idx) => {
                            let planType = (obj.plan_type && obj.plan_type === 'monthly') ? 'Monthly' : 'Pay As You Go';
                            let planName = (obj.plan_name) ? obj.plan_name : 'N/A';

                            return (
                              <div key={idx} className="treatment-tr">
                                <div className="treatment-td col-xs-7">{planName}</div>
                                <div className="treatment-td col-xs-5">{planType} <a onClick={(e) => this.props.showUseConfirmation(obj)} className="pull-right"><img src={calRight} /></a></div>
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>}
                  </div>
                </div>
              </div>
            </div>
          }


          {
            <div className={(this.state.parentState.showCreateTreatModal === true) ? "blackOverlay" : "blackOverlay no-display"}>
              <form onSubmit={this.props.handleChildFormSubmit}>
                <div className="vert-middle">
                  <div className="loyaltyMembership treatmentPlan">
                    <div className="newPopupTitle">{(this.state.parentState.requestType === 'add') ? 'Create Treatment Plan' : 'Edit Treatment Plan'} <a onClick={() => this.props.cancelCreateTreatmenPlan()} className="popupClose"><img src={picClose} /></a></div>

                    {/*<div className="radio-outer typeTreatmentPlan">
                      <input type="radio" name="prescribeOnly" id="treatment" value="0" checked={this.state.parentState.prescribeOnly === '0'} onChange={this.props.handleChildChange}/>
                      <label for="treatment">Treatment</label>
                      <input type="radio" name="prescribeOnly" id="prescribed" value="1" checked={this.state.parentState.prescribeOnly === '1'} onChange={this.props.handleChildChange}/>
                      <label for="prescribed" className="no-padding-right">Prescribed only</label>
                    </div>*/}

                    <div className="newPopupContent">
                      <div className="row m-b-15">
                        {(this.state.parentState.requestType === 'add') && <div className="col-sm-4 col-xs-12">
                          <div className="simpleField">
                            <div className="simpleLabel">Treatment plan type</div>
                            <select type="text" className="simpleSelect" name="treatType" onChange={this.props.handleChildChange} value={this.state.parentState.treatType}>
                              <option value="payg">Pay as you go</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                        </div>}
                        <div className={(this.state.parentState.requestType === 'add') ? "col-sm-4 col-xs-12 calender" : "col-sm-6 col-xs-12 calender"}>
                          <div className="simpleField field-icon">
                            <div className="simpleLabel">Treatment plan start on</div>
                            <div ref="pickerField">
                              {(this.state.parentState.treatType === 'payg') && <CustomDatePicker
                                name="treatmentStartOn"
                                onChangeDatePicker={this.props.onChangeChildDatePicker}
                                minDate={new Date()}
                                maxDate={new Date(moment().add(10, "years").toDate())}
                                value={this.state.parentState.treatmentStartOn}
                                class={'simpleInput'}
                                format={dateFormatPicker()}
                              /> }
                              {(this.state.parentState.treatType === 'monthly') && <CustomDatePicker
                                    name="treatmentStartOn"
                                    onChangeDatePicker={this.props.onChangeChildDatePicker}
                                    minDate={new Date()}
                                    maxDate={new Date(moment().add(10, "years").toDate())}
                                    value={this.state.parentState.treatmentStartOn}
                                    class={'simpleInput'}
                                    format="MMMM, yyyy"
                                    showMonthYearPicker={true}
                              />}
                            </div>

                            <a onClick={this.toggleCalendar} className="simple-cal-icon" />
                          </div>
                        </div>
                        <div className={(this.state.parentState.requestType === 'add') ? "col-sm-4 col-xs-12 calender" : "col-sm-6 col-xs-12 calender"}>
                          <div className="simpleField">
                            <div className="simpleLabel">{(this.state.parentState.treatType === 'payg') ? 'Treatment plan expires after' : 'Plan duration'}</div>
                            <select type="text" className="simpleSelect" name="expirePlanAfter" onChange={this.props.handleChildChange} value={this.state.parentState.expirePlanAfter}>
                              {expireAfterOptData}
                            </select>
                          </div>
                        </div>
                      </div>

                      {<div className={(this.state.parentState.showPaygSection === true) ? "add-product-outer" : "add-product-outer no-display"}>
                        {this.state.parentState.multiplePaygList.map((obj, idx) => {
                          const paygElemClass = (this.state.parentState.multiplePaygClassList[idx]) ? this.state.parentState.multiplePaygClassList[idx] : 'simpleInput';

                          return (
                            <div key={`payg_row_`+idx} className="row product-row">
                              <div className="col-sm-5">
                                <div className="simpleField">
                                  <div className="simpleLabel">Product</div>
                                  <input type="text" className={paygElemClass.product_name} placeholder="Type to search product..." name="product_name" onChange={this.props.handleChildProductChange} value={obj.product_name} data-index={idx} autoComplete={'off'}/></div>

                                  <ul key={`payg_row_found_`+idx} className={(this.state.parentState.treatType === 'payg' && this.state.parentState.productData && this.state.parentState.productData.length && this.state.parentState.showSearchResult && idx === parseInt(this.state.parentState.selProIndex)) ? " search-dropdown" : "cal-dropdown clinicname-dropdown no-display"}>
                                  {this.state.parentState.productData && this.state.parentState.productData.length && this.state.parentState.productData.map((obj, iidx) => {
                                      return(
                                          <li key={"product_"+iidx} onClick={(e) => this.props.selectChildProduct(obj)}>
                                            <a>
                                                {obj && obj.data && obj.data.product_name && capitalizeFirstLetter(obj.data.product_name)}
                                            </a>
                                          </li>
                                        )
                                    })}
                                  </ul>
                                  <ul key={`payg_row_not_found_`+idx} className={(this.state.parentState.productData && !this.state.parentState.productData.length && this.state.parentState.showSearchResult && idx === parseInt(this.state.parentState.selProIndex)) ? "search-dropdown" : " cal-dropdown clinicname-dropdown no-display"}>
                                  {( this.state.parentState.productData && this.state.parentState.productData.length === 0 ) &&
                                    <li><a>There were no matches, please enter relevant keywords</a></li>
                                   }
                                  </ul>
                              </div>
                              <div className="col-sm-2 payg-dosage">
                                <div className="simpleField">
                                  <div className="simpleLabel">Dosage</div>
                                  <input type="text" className={paygElemClass.units} name="units" onChange={this.props.handleChildChange} value={obj.units} data-index={idx} placeholder="Enter units" autoComplete={'off'}/>
                                </div>
                              </div>
                              <div className="col-sm-5">
                                <div className="col-sm-3 col-xs-4 no-padding">
                                  <div className="simpleField">
                                    <div className="simpleLabel Recurrence-period">Recurrence period</div>
                                    <input type="text" className={paygElemClass.rep_val} name="rep_val" onChange={this.props.handleChildChange} value={obj.rep_val} data-index={idx} placeholder="Every" autoComplete={'off'}/>
                                  </div>
                                </div>
                                <div className="col-sm-7 col-xs-8 no-padding-right">
                                  <div className="simpleField">
                                    <select type="text" className={paygElemClass.rep_by} name="rep_by" onChange={this.props.handleChildChange} value={obj.rep_by} data-index={idx}>
                                      <option value="day">Days(s)</option>
                                      <option value="week">Week(s)</option>
                                      <option value="month">Month(s)</option>
                                      <option value="year">Year(s)</option>
                                    </select>
                                  </div>
                                </div>
                                {(this.state.parentState.multiplePaygList.length > 1 && idx > 0) && <a key={`remove_payg_row`+idx} data-index={idx} className="remove-product payg-pro-remove" onClick={this.props.removePaygRows}><img data-index={idx} src={popupClose} /></a>}
                              </div>
                            </div>
                          )
                        }) }
                        <a className="simple-btn add-product-btn" onClick={() => this.props.addMorePaygRows()}>Add Product</a>
                      </div>}

                      {
                        <div className={(this.state.parentState.showMonthlySection === true) ? "add-product-outer" : "add-product-outer no-display"}>
                            <div className="row product-row">
                              <div className="col-xs-12">
                                <div className="simpleField">
                                  <div className="simpleLabel">Your skin care goal</div>
                                  <input type="text" className={this.state.parentState.skinGoalClass} placeholder="Type your skin goal..." name="skinGoal" onChange={this.props.handleChildChange} value={this.state.parentState.skinGoal} autoComplete={'off'}/></div>
                              </div>
                            </div>
                            { <div className={(this.state.parentState.showPreviewBtn && this.state.parentState.multipleMonthlyList && this.state.parentState.showMonthlySection === true) ? '' : 'no-display'}>
                              {(this.state.parentState.showMonthlySection === true) && this.state.parentState.multipleMonthlyList && this.state.parentState.multipleMonthlyList.length > 0 && this.state.parentState.multipleMonthlyList.map((mobj, midx) => {
                                  return (
                                    <div key={midx}>
                                      {mobj.dataRows && mobj.dataRows.map((mmobj, mmidx) => {

                                          const monthlyElemClass = (this.state.parentState.showPreviewBtn && this.state.parentState.multipleMonthlyList && this.state.parentState.showMonthlySection === true && this.state.parentState.multipleMonthlyClassList) ? this.state.parentState.multipleMonthlyClassList[midx]['dataRows'][mmidx] : 'simpleInput';

                                          return (
                                              <div key={mmidx} className="row">
                                                <div className="col-xs-7">
                                                  <div className="simpleField">
                                                    <div className="simpleLabel">Treatment in {moment(mmobj.month).format('MMMM, YYYY')}</div>
                                                    <input type="text" className={monthlyElemClass.product_name} placeholder="Type to search product..." name="product_name" onChange={this.props.handleChildProductChange} value={mmobj.product_name} data-parentindex={midx} data-index={mmidx} autoComplete={'off'} /></div>

                                                    <ul key={`payg_row_found_`+midx+`_`+mmidx} className={(this.state.parentState.treatType === 'monthly' && this.state.parentState.productData && this.state.parentState.productData.length && this.state.parentState.showSearchResult && mmidx === parseInt(this.state.parentState.selProIndex) && midx === parseInt(this.state.parentState.selProParentIndex)) ? " search-dropdown" : "cal-dropdown clinicname-dropdown no-display"}>
                                                    {this.state.parentState.productData && this.state.parentState.productData.length && this.state.parentState.productData.map((obj, iidx) => {
                                                        return(
                                                            <li key={"product_"+iidx} onClick={(e) => this.props.selectChildProduct(obj)}>
                                                              <a>
                                                                  {obj && obj.data && obj.data.product_name && capitalizeFirstLetter(obj.data.product_name)}
                                                              </a>
                                                            </li>
                                                          )
                                                      })}
                                                    </ul>
                                                    <ul key={`payg_row_not_found_`+midx+`_`+mmidx} className={(this.state.parentState.productData && !this.state.parentState.productData.length && this.state.parentState.showSearchResult && this.state.parentState.showSearchResult && mmidx === parseInt(this.state.parentState.selProIndex) && midx === parseInt(this.state.parentState.selProParentIndex)) ? "search-dropdown" : " cal-dropdown clinicname-dropdown no-display"}>
                                                    {( this.state.parentState.productData && this.state.parentState.productData.length === 0 ) &&
                                                      <li><a>There were no matches, please enter relevant keywords</a></li>
                                                     }
                                                    </ul>

                                                </div>
                                                <div className="col-xs-4">
                                                  <div className="simpleField">
                                                    <div className="simpleLabel">Dosage</div>
                                                    <input type="text" className={monthlyElemClass.units} name="units" onChange={this.props.handleChildChange} value={mmobj.units} data-parentindex={midx} data-index={mmidx} placeholder="Enter units" autoComplete={'off'}/>
                                                  </div>
                                                </div>
                                                {(this.state.parentState.multipleMonthlyList.length && mmidx > 0) && <a key={`remove_payg_monthly_`+midx+`_`+mmidx} data-parentindex={midx} data-index={mmidx} className="remove-product monthly-pro-remove" onClick={() => this.props.removeMonthlyRows(midx, mmidx)}><img data-parentindex={midx} data-index={mmidx} src={popupClose} /></a>}
                                              </div>
                                          )
                                        })
                                        }
                                      <a data-index={midx} onClick={() => this.props.addMoreMonthlyRows(midx, mobj)} className="simple-btn add-product-btn m-b-20">Add Treatment in {moment(mobj.month).format('MMMM, YYYY')}</a>
                                    </div>
                                  )
                                })
                              }

                            </div>}
                          </div>
                      }

                    </div>
                    {(this.state.parentState.showPreviewBtn) && <div className="newPopupfooter">
                      {(this.state.parentState && this.state.parentState.subscriptionID === 0) && <input className="simple-btn pull-right" type="submit" name="submitPlan" value="Preview" data-type="preview"/>}
                      <a onClick={this.props.saveThePlan} className="pull-right simple-btn m-r-5 " name="savePlan">Save</a>
                    </div>}
                    {(this.state.parentState.showGenerateBtn) && <div className="newPopupfooter">
                      <a className="simple-btn pull-right" onClick={this.props.generateChildMonthlyHTML}>Generate HTML</a>
                    </div>}
                  </div>
                </div>
              </form>
            </div>

          }
        </div>
    );
  }
}


export default TreatmentPlan;
