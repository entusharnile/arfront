import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { ToastContainer, toast } from "react-toastify";
import { checkIfPermissionAllowed, numberFormat } from '../../Utils/services.js';
import {getTraceData, getBatchByProcedure, getUnits, saveTrace, updateTrace, deleteTrace} from '../../Actions/Traceability/traceActions.js';
import picClose from '../../images/close.png';
import {showFormattedDate} from '../../Utils/services.js';



class TraceabilityInfo extends Component {
  constructor(props) {
    super(props);

    const languageData  = JSON.parse(localStorage.getItem('languageData'))

    this.state = {
      backURLType      : (this.props.match.params.actionType) ? this.props.match.params.actionType : 'clients',
      action           : (this.props.match.params.type) ? this.props.match.params.type : 'profile',
      clientID         : this.props.match.params.clientID,
      procedureID      : this.props.match.params.procedureID,
      globalLang       : languageData.global,
      showLoader       : false,
      traceData        : [],
      showTraceSection : false,
      productForTrace  : 0,
      traceToDelete    : 0,
      productToDelete  : 0,
      traceMode        : null,
      batchData        : [],
      dataChanged      : false,
      batch_id         : 0,
      batch_units      : 0,
      unitData         : [],
      traceID          : 0,
      saveTraceStatus  : null,
      updateTraceStatus: null,
      deleteTraceStatus: null,
      languageData     : languageData.clients,
    }
  }

  componentDidMount = () => {
    this.setState({
      showLoader: true
    });

    this.props.getTraceData(this.state.clientID, this.state.procedureID)
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.saveTraceStatus !== null && this.state.saveTraceStatus !== '' && this.state.saveTraceStatus !== prevState.saveTraceStatus) {
      this.props.getTraceData(this.state.clientID, this.state.procedureID)
      this.setState({ showLoader: true, traceMode: null });
    }

    if (this.state.updateTraceStatus !== null && this.state.updateTraceStatus !== '' && this.state.updateTraceStatus !== prevState.updateTraceStatus) {
      this.props.getTraceData(this.state.clientID, this.state.procedureID)
      this.setState({ showLoader: true, traceMode: null });
    }

    if (this.state.deleteTraceStatus !== null && this.state.deleteTraceStatus !== '' && this.state.deleteTraceStatus !== prevState.deleteTraceStatus) {
      this.props.getTraceData(this.state.clientID, this.state.procedureID)
      this.setState({ showLoader: true, traceToDelete: 0, productToDelete: 0, showModal: false });
    }
  }

  handleInputChange = (event) => {
     const target = event.target;
     const value = target.type === 'checkbox' ? target.checked : target.value;
     this.setState({[event.target.name]: value , dataChanged : true});

     if ( event.target.name === 'batch_id' ) {
       this.getUnitsByInventory(target.value)
     }
  }

  static getDerivedStateFromProps(props, state) {
    if(props.showLoader != undefined && props.showLoader == false) {
        return {showLoader : false};
     }
    if ( props.traceData !== undefined && props.traceData.status === 200 && props.traceData.data !== state.traceData ) {
      return {
        traceData         : props.traceData.data,
        showLoader        : false,
        toxinTypes        : props.traceData.data.toxin_types,
        showTraceSection  : false
      }
    }

    if ( props.batchData !== undefined && props.batchData.status === 200 && props.batchData.data.batch_data !== state.batchData ) {
      if ( props.batchData.data.batch_data.length ) {
        return {
          batchData         : props.batchData.data.batch_data,
          batch_id          : props.batchData.data.selected_batch,
          batch_units       : props.batchData.data.selected_unit,
          unitData          : props.batchData.data.unit_data,
          showLoader        : false,
          showTraceSection  : true,
        }
      } else {
        toast.dismiss();
        toast.error("No data found")
        return {
          batchData         : props.batchData.data.batch_data,
          showLoader        : false,
          traceMode         : null
        }
      }
    }

    if ( props.unitData !== undefined && props.unitData.status === 200 && props.unitData.data !== state.unitData ) {
      return {
        unitData            : props.unitData.data,
        showLoader          : false,
      }
    }

    if ( props.saveTraceData !== undefined && props.saveTraceData !== null && props.saveTraceData.status === 200 && props.saveTraceData.data !== state.saveTraceData ) {
      return {
        saveTraceData       : props.saveTraceData.data,
        saveTraceStatus     : props.saveTraceData.data
      }
    }

    if ( props.updateTraceData !== undefined && props.updateTraceData !== null && props.updateTraceData.status === 200 && props.updateTraceData.data !== state.updateTraceData ) {
      return {
        updateTraceData     : props.updateTraceData.data,
        updateTraceStatus   : props.updateTraceData.data
      }
    }

    if ( props.deleteTraceData !== undefined && props.deleteTraceData !== null && props.deleteTraceData.status === 200 && props.deleteTraceData.data !== state.deleteTraceData ) {
      return {
        deleteTraceData     : props.deleteTraceData.data,
        deleteTraceStatus   : props.deleteTraceData.data
      }
    }

    return null
  }

  addUpdateTraceInfo = (productID, traceID) => {
    if ( this.state.showTraceSection == false ) {
      let type = '';

      if ( traceID > 0 ) {
        type = 'update';
        this.setState({showLoader: true, productForTrace: productID, traceMode: type, traceID: traceID})
      } else {
        type = 'add';
        this.setState({showLoader: true, productForTrace: productID, traceMode: type, traceID: 0})
      }

      this.props.getBatchByProcedure(productID, this.state.procedureID, type, traceID)
    }
  }

  cancelAddEditTrace = () => {
    this.setState({showTraceSection: false, traceMode: null, productForTrace: 0, batch_id: 0, batch_units: 0})
  }

  showDeleteTraceModal = (traceID, productID) => {
    if ( traceID ) {
      this.setState({traceToDelete: traceID, productToDelete: productID, showModal: true})
    }
  }

  dismissModal = () => {
    this.setState({traceToDelete: 0, productToDelete: 0, showModal: false})
  }

  deleteTraceData = () => {
    if ( this.state.traceToDelete, this.state.productToDelete, this.state.procedureID ) {

      let formData = {
        procedure_id  : this.state.procedureID,
        product_id    : this.state.productToDelete,
        trace_id      : this.state.traceToDelete
      }

      this.setState({showModal: false, showLoader: true})
      this.props.deleteTrace(formData)
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();


    if ( this.state.batch_id > 0 && this.state.batch_units > 0 ) {
      if ( this.state.traceMode && this.state.traceMode === 'add' ) {
        let formData = {
          inventory_id  : this.state.batch_id,
          units         : this.state.batch_units,
          procedure_id  : this.state.procedureID,
          product_id    : this.state.productForTrace
        }

        this.props.saveTrace(formData);
      } else {
        let formData = {
          inventory_id  : this.state.batch_id,
          units         : this.state.batch_units,
          procedure_id  : this.state.procedureID,
          product_id    : this.state.productForTrace,
          trace_id      : this.state.traceID
        }

        this.props.updateTrace(formData);
      }
      this.setState({showLoader: true})
    } else {
      toast.error("Please select Batch ID and Units");
    }
  }

  getUnitsByInventory = (inventoryID) => {
    if ( inventoryID > 0 ) {
      let formData = {
        inventory_id  : inventoryID,
        old_trace     : this.state.traceID,
        procedure_id  : this.state.procedureID,
        product_id    : this.state.productForTrace
      }

      this.props.getUnits(formData);
      this.setState({showLoader: true})
    }
  }

  render() {
    let returnTo      = '';
    let batchOptData  = '';
    let unitsOptData  = '';

    if ( this.state.backURLType && this.state.backURLType === 'clients' ) {
      returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID  : "/" + this.state.backURLType
    } else {
      returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.procedureID + "/" + this.props.match.params.subType  : "/" + this.state.backURLType + "/" + this.props.match.params.subType
    }

    if ( this.state.batchData !== undefined && this.state.batchData.length > 0 )  {
      batchOptData = this.state.batchData.map((batchObj, batchIdx) => {
        return <option key={batchIdx} value={batchObj.id}>{batchObj.batch_id}</option>
      })
    }

    if ( this.state.unitData !== undefined && this.state.unitData.length > 0 )  {
      unitsOptData = this.state.unitData.map((unitObj, unitIdx) => {
        return <option key={unitIdx} value={unitObj}>{unitObj}</option>
      })
    }

    return (
      <div id="content">
         <div className="container-fluid content setting-wrapper">
            <div className="juvly-section full-width m-t-15">
               <div className="juvly-container">
                  <div className="juvly-title m-b-0">
                     {this.state.languageData.clientprofile_trace_info}
                     <Link to={returnTo} className="pull-right">
                     <img src={picClose}/></Link>
                  </div>
               </div>
               {(this.state.traceData.injections !== undefined && this.state.traceData.injections !== null && this.state.traceData.injections.length > 0 ) && this.state.traceData.injections.map((tobj, tidx) => {

                let unitsUsed     = 0.0;
                let addTraceClass = "new-blue-btn pull-right trac-info-btn";

                if ( tobj.trace_injection !== undefined && tobj.trace_injection !== null && tobj.trace_injection.length > 0 ) {
                  tobj.trace_injection.map((traceInjObj, traceInjIdx) => {
                    unitsUsed += traceInjObj.units_consumed;
                  })

                  if ( numberFormat(tobj.quantity, 'decimal') === numberFormat(unitsUsed, 'decimal') ) {
                    addTraceClass = "new-blue-btn pull-right trac-info-btn disable";
                  }
                }

                if ( this.state.traceMode === 'add' && (this.state.productForTrace === tobj.product.id) ) {
                  addTraceClass = "new-blue-btn pull-right trac-info-btn no-display";
                }

                return (
                   <div key={tidx} className="Traceability-section">
                    <div className="juvly-container">
                       <div className="juvly-subtitle no-margin">{++tidx} - {(tobj.product) ? tobj.product.product_name : ''} {(tobj.quantity) ? numberFormat(tobj.quantity, 'decimal') : ''} {(this.state.toxinTypes && tobj.product) ? this.state.toxinTypes[tobj.product.toxin_type] : ''}

                          {(addTraceClass.indexOf('disable') === -1) ? <a onClick={() => this.addUpdateTraceInfo(tobj.product.id, 0)} className={addTraceClass}>{this.state.languageData.trace_add_trace_info}</a> : <a className={addTraceClass}>{this.state.languageData.trace_add_trace_info}</a>}
                       </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table-updated juvly-table no-hover">
                          <thead className="table-updated-thead">
                             <tr>
                                <th className="col-xs-2 table-updated-th">{this.state.languageData.trace_bacth_id}</th>
                                <th className="col-xs-2 table-updated-th">{this.state.languageData.trace_expiration}</th>
                                <th className="col-xs-2 table-updated-th">{this.state.languageData.trace_units}</th>
                                <th className="col-xs-2 table-updated-th">{this.state.languageData.trace_price}</th>
                                <th className="col-xs-2 table-updated-th">{this.state.languageData.trace_actions}</th>
                             </tr>
                          </thead>
                          <tbody>

                             { (tobj.trace_injection !== undefined && tobj.trace_injection !== null && tobj.trace_injection.length > 0 ) && tobj.trace_injection.map((traceInjObj, traceInjIdx) => {

                                return (
                                  <tr key={traceInjIdx} className="table-updated-tr">
                                     <td className="table-updated-td">{(traceInjObj.product_inventory) ? traceInjObj.product_inventory.batch_id : ''}</td>
                                     <td className="table-updated-td">{(traceInjObj.product_inventory) ? showFormattedDate(traceInjObj.product_inventory.expiry_date, false, 'DD-MMM-YYYY'): ''}</td>
                                     <td className="table-updated-td">{(traceInjObj.units_consumed) ? numberFormat(traceInjObj.units_consumed, 'decimal') : ''}</td>
                                     <td className="table-updated-td">{(traceInjObj.price) ? numberFormat(traceInjObj.price, 'currency') : ''}</td>
                                     <td className="table-updated-td"><a onClick={() => this.addUpdateTraceInfo(tobj.product.id, traceInjObj.id)} className="easy-link">{this.state.languageData.client_edit}</a><a onClick={() => this.showDeleteTraceModal(traceInjObj.id, tobj.product.id)} className="easy-link">{this.state.languageData.client_delete}</a></td>
                                  </tr>
                                )
                             })}

                             <tr className={(tobj.trace_injection === undefined || tobj.trace_injection.length === 0 ) ? "table-updated-tr" : "table-updated-tr no-display"}>
                                <td colSpan="5" className="text-center">{this.state.languageData.client_no_record_found}</td>
                             </tr>

                             <tr className={(this.state.showTraceSection && (this.state.productForTrace === tobj.product.id)) ? "table-updated-tr editQuestion_tr" : "table-updated-tr editQuestion_tr no-display"}>
                                <td colSpan="5">
                                   <div className="setting-container bg-light-blue">
                                      <div className="setting-title m-b-40">{(this.state.traceMode && this.state.traceMode === 'add') ? "Add Traceability Info" : "Edit Traceability Info"}
                                         <a onClick={() => this.cancelAddEditTrace()} className="pull-right cancel_editAction"><img src={picClose}/></a>
                                      </div>
                                      <form onSubmit={this.handleSubmit}>
                                        <div className="row">
                                           <div className="col-lg-2 col-md-3 col-sm-4 col-xs-12">
                                              <div className="setting-field-outer no-ques-margin">
                                                 <div className="new-field-label">{this.state.languageData.trace_bacth_id}</div>
                                                 <div className="setting-input-outer">
                                                    <select className="setting-select-box" name="batch_id" onChange={this.handleInputChange} value={this.state.batch_id}>
                                                        <option value="0">Select</option>
                                                        {batchOptData}
                                                    </select>
                                                 </div>
                                              </div>
                                           </div>
                                           <div className="col-lg-1 col-md-2 col-sm-3 col-xs-12">
                                              <div className="setting-field-outer">
                                                 <div className="new-field-label">{this.state.languageData.trace_units}</div>
                                                 <div className="setting-input-outer">
                                                    <select className="setting-select-box" name="batch_units" onChange={this.handleInputChange} value={this.state.batch_units}>
                                                        <option value="0">Select</option>
                                                        {unitsOptData}
                                                    </select>
                                                 </div>
                                              </div>
                                           </div>
                                           <div className="col-sm-12">
                                              <a onClick={() => this.cancelAddEditTrace()} className="new-white-btn cancel_editAction">{this.state.languageData.clientprofile_cancel}</a>
                                              <input className="new-blue-btn" type="submit" id="save-profile" value={(this.state.traceMode && this.state.traceMode === 'add') ? this.state.languageData.wallet_add : this.state.languageData.client_update}/>
                                           </div>
                                          </div>
                                       </form>
                                   </div>
                                </td>
                             </tr>
                          </tbody>
                       </table>
                    </div>
                 </div>
               )
             })
             }

             <div className={(this.state.showModal === true ) ? 'overlay' : ''}></div>
             <div id="filterModal" role="dialog" className={(this.state.showModal === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
                <div className="modal-dialog">
                   <div className="modal-content">
                     <div className="modal-header">
                       <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                       <h4 className="modal-title">{this.state.languageData.client_conf_requierd}</h4>
                     </div>
                     <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                        {this.state.languageData.trace_delete_message}
                     </div>
                     <div className="modal-footer" >
                       <div className="col-md-12 text-left">
                         <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.languageData.client_no}</button>
                         <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteTraceData}>{this.state.languageData.client_yes}</button>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               <div className={(this.state.traceData.injections === undefined || this.state.traceData.injections.length === 0 ) ? "no-record" : "no-record no-display"}>
                  {this.state.languageData.trace_no_injection}
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
  if ( state.TraceReducer.action === 'GET_TRACE_DATA' ) {
    if ( state.TraceReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.TraceReducer.data.message])
      returnState.showLoader = false
    } else {
      returnState.traceData = state.TraceReducer.data
    }
  }

  if ( state.TraceReducer.action === 'GET_BATCH_BY_PROCEDURE' ) {
    if ( state.TraceReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.TraceReducer.data.message])
      returnState.showLoader = false
    } else {
      returnState.batchData = state.TraceReducer.data
    }
  }

  if ( state.TraceReducer.action === 'GET_UNITS_BY_INVENTORY' ) {
    if ( state.TraceReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.TraceReducer.data.message])
      returnState.showLoader = false
    } else {
      returnState.unitData = state.TraceReducer.data
    }
  }

  if ( state.TraceReducer.action === 'SAVE_TRACE' ) {
    if ( state.TraceReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.TraceReducer.data.message])
      returnState.showLoader = false
    } else {
      toast.success(languageData.global[state.TraceReducer.data.message])
      returnState.saveTraceData = state.TraceReducer.data
    }
  }

  if ( state.TraceReducer.action === 'UPDATE_TRACE' ) {
    if ( state.TraceReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.TraceReducer.data.message])
      returnState.showLoader = false
    } else {
      toast.success(languageData.global[state.TraceReducer.data.message])
      returnState.updateTraceData = state.TraceReducer.data
    }
  }

  if ( state.TraceReducer.action === 'DELETE_TRACE' ) {
    if ( state.TraceReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.TraceReducer.data.message])
      returnState.showLoader = false
    } else {
      toast.success(languageData.global[state.TraceReducer.data.message])
      returnState.deleteTraceData = state.TraceReducer.data
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({getTraceData: getTraceData, getBatchByProcedure: getBatchByProcedure, getUnits: getUnits, saveTrace: saveTrace, updateTrace: updateTrace, deleteTrace: deleteTrace}, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps) (TraceabilityInfo);
