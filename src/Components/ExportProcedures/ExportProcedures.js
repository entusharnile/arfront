import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { ToastContainer, toast } from "react-toastify";
import { capitalizeFirstLetter, showFormattedDate, displayName, checkIfPermissionAllowed, numberFormat } from '../../Utils/services.js';
import picClose from '../../images/close.png';
import defVImage from '../../images/no-image-vertical.png';
import {getClientDetail, exportClientProcedures} from '../../Actions/Clients/clientsAction.js';


class ExportProcedures extends Component {
  constructor(props) {
    super(props);

    const languageData  = JSON.parse(localStorage.getItem('languageData'));
    let defTimeLine     = (localStorage.getItem("defTimeLine")) ? localStorage.getItem("defTimeLine") : 'cosmetic';

    this.state = {
      backURLType           : (props.match.params.actionType) ? props.match.params.actionType : 'clients',
      action                : (props.match.params.type) ? props.match.params.type : 'profile',
      showLoader            : false,
      globalLang            : languageData.global,
      clientID              : this.props.match.params.clientID,
      dataChanged           : false,
      def_no_image_vertical : defVImage,
      totalChecked          : 0,
      selected              : [],
      falseCount            : 0,
      defTimeLine           : defTimeLine,
      languageData          : languageData.clients,
    }
  }

  componentDidMount() {
    this.setState({
      showLoader: true
    });

    this.state.clientScopes = 'procedures';
    this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
  }

  static getDerivedStateFromProps(props, state) {
    if ( props.clientData !== undefined && props.clientData.status === 200 && props.clientData.data !== state.clientData ) {
      return {
        clientData  : props.clientData.data,
        showLoader  : false
      }
    } else if ( props.clientData !== undefined && props.clientData.status !== 200 && props.clientData.data !== state.clientData ) {
      return {
        clientData  : props.clientData.data,
        showLoader  : false
      }
    }

    if ( props.exportProData !== undefined && props.exportProData.status === 200 && props.exportProData.data !== state.exportProData ) {
      let returnState              = {};
      returnState.exportProData    = props.exportProData.data;
      returnState.selected         = [];

      if ( props.exportProData.data ) {
        ///var/window.location.href           = props.exportProData.data;
        window.open(props.exportProData.data, "_blank");
      }
      returnState.showLoader       = false;
      return returnState
    } else if ( props.exportProData !== undefined && props.exportProData.status !== 200 && props.exportProData.data !== state.exportProData ) {
      return {
        exportProData  : props.exportProData.data,
        showLoader     : false
      }
    }

    return null
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;

    this.setState({
      [event.target.name]: value
    });

    if ( target.type === "checkbox" ) {
      let val = event.target.value
      let idx = event.target.name.split('_')[1]

      if ( this.state.selected.length > 0 && this.state.selected[idx] !== undefined) {
        let newSelected = this.state.selected;
        let falseCount  = this.state.falseCount;

    		newSelected[[idx]][val] = !this.state.selected[[idx]][val];

        if ( !newSelected[[idx]][val] ) {
          falseCount      = falseCount + 1;
        }

        if ( falseCount <= this.state.selected.length ) {
          falseCount = 0
        }

    		this.setState({
    			selected: newSelected,
          falseCount: falseCount
    		});
      } else {
        let newSelected = this.state.selected;

        let falseCount  = this.state.falseCount;

        if ( falseCount > 0 ) {
          falseCount      = falseCount - 1;
        }

        let a     = {};
        a[val]    = true;

        newSelected[idx] = a;
    		this.setState({
    			selected: newSelected,
          falseCount: falseCount
    		});
      }
    }
  };

  exportProcedures = () => {
    let exportPro   = false;
    let proIDArray  = [];

    if ( this.state.selected.length > 0 ) {
      this.state.selected.map((ob, id) => {
        for ( let proID in ob ) {
          if ( ob[proID] === true ) {
            exportPro = true
            proIDArray.push(proID)
          }
        }
      })
    }

    if ( exportPro === true ) {
      let formData = {
        patient_id: this.state.clientID,
        pro_ids   : proIDArray,
        default_template : this.state.defTimeLine
      }

      this.setState({showLoader: true})
      this.props.exportClientProcedures(formData)
    }
  }

  render() {
    let totalChecked = 0;

    if ( this.state.selected.length > 0 ) {
      this.state.selected.map((ob, id) => {
        for ( let proID in ob ) {
          if ( ob[proID] === true ) {
            totalChecked = 1;
          }
        }
      })
    }


    let returnTo = '';

    if ( this.state.backURLType && this.state.backURLType === 'clients' ) {
      returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID  : "/" + this.state.backURLType
    } else {

    }

    let clientName = '';

    if ( this.state.clientData ) {
      clientName = displayName(this.state.clientData)
    }
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <div className="merge-outer">
             <div className="merge-setion">
               <div className="juvly-container">
                 {<div className="juvly-title m-b-20"> {this.state.showLoader === false && <span>{clientName} - {this.state.languageData.clientprofile_export_procedure}</span>}

                   <Link to={returnTo} className="pull-right"><img src={picClose} /></Link>
                 </div>}
                 <div className="table export-procedure">

                   {(this.state.defTimeLine === 'cosmetic' && this.state.clientData && this.state.clientData.procedure && this.state.clientData.procedure.length > 0) && this.state.clientData.procedure.map((obj, idx) => {
                     return (
                         <div className="table-row" key={idx}>
                           <div className="table-cell export-input">
                             <input type="checkbox" id={'childCheck_'+idx} name={'childCheck_'+idx} checked={(this.state.selected.length > 0 && this.state.selected[idx] !== undefined) && this.state.selected[[idx]][obj.procedure.id] === true} onChange={this.handleInputChange} value={obj.procedure.id}/>
                           </div>
                           <div className="table-cell">
                             <label htmlFor={'childCheck_'+idx}><div className="export-pro-image">
                               <img src={(obj.procedure.procedure_image_data !== null && obj.procedure.procedure_image_data.patient_image_front_thumb_url !== "") ? obj.procedure.procedure_image_data.patient_image_front_thumb_url : this.state.def_no_image_vertical} />
                             </div></label>
                           </div>
                           <div className="table-cell">
                             <div className="pro-proc-title">{obj.procedure.procedure_name}</div>
                             <div className="export-pro-time">{showFormattedDate(obj.procedure.procedure_date, true)}</div>
                             <span className="juvly-subtitle no-margin">{this.state.languageData.client_notes}</span>
                             <div className="export-pro-note">
                               {(obj.procedure && obj.procedure.procedure_notes && obj.procedure.procedure_notes.length > 0) && obj.procedure.procedure_notes.map((iobj, iidx) => {
                                 return (
                                   <div key={iidx} className="p-text pro-to-export">{iobj.notes}</div>
                                 )
                               })
                               }
                             </div>
                           </div>
                       </div>
                     )
                   })
                   }
                   {(this.state.defTimeLine === 'cosmetic' && this.state.showLoader === false && this.state.clientData && this.state.clientData.procedure && this.state.clientData.procedure.length === 0) && <div className="table-row"><div className="no-record "><div className="text-center">{this.state.languageData.client_no_procedure_found}</div></div></div>}


                   {(this.state.defTimeLine === 'health' && this.state.clientData && this.state.clientData.procedure_health && this.state.clientData.procedure_health.length > 0) && this.state.clientData.procedure_health.map((obj, idx) => {
                     return (
                         <div className="table-row" key={idx}>
                           <div className="table-cell export-input">
                             <input type="checkbox" id={'childCheck_'+idx} name={'childCheck_'+idx} checked={(this.state.selected.length > 0 && this.state.selected[idx] !== undefined) && this.state.selected[[idx]][obj.id] === true} onChange={this.handleInputChange} value={obj.id}/>
                           </div>

                           <div className="table-cell">
                             <div className="pro-proc-title">{obj.procedure_name}</div>
                             <div className="export-pro-time">{showFormattedDate(obj.procedure_date, true)}</div>
                             <p className="p-text no-margin"><b>Provider:</b> {capitalizeFirstLetter(obj.doctor_name)}</p>
                             <p className="p-text no-margin"><b>Consultation fee:</b> {numberFormat(obj.consultation_fee, 'currency')}</p>
                           </div>

                           <div className="table-cell">
                               <span className="juvly-subtitle no-margin">Notes:</span>
                               <div className="export-pro-note">
                                 {(obj.procedure_notes && obj.procedure_notes.length > 0) && obj.procedure_notes.map((iobj, iidx) => {
                                   return (
                                     <div key={iidx} className="p-text pro-to-export">{iobj.notes}</div>
                                   )
                                 })
                                 }
                               </div>
                           </div>

                       </div>
                     )
                   })
                   }
                   {(this.state.defTimeLine === 'health' && this.state.showLoader === false && this.state.clientData && this.state.clientData.procedure_health && this.state.clientData.procedure_health.length === 0) && <div className="table-row"><div className="no-record "><div className="text-center">Sorry, No procedure found</div></div></div>}
                 </div>
               </div>
               {(this.state.showLoader === false) && <div className="footer-static">
                 <a id="saveConsultation" className={(totalChecked > 0) ? "new-blue-btn pull-right" : "new-blue-btn pull-right disable"} onClick={() => this.exportProcedures()}>{this.state.globalLang.label_export_text}</a>
               </div>}
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
  const languageData  = JSON.parse(localStorage.getItem('languageData'))
  let returnState     = {}

  if ( state.ClientsReducer.action === 'GET_CLIENT_DETAIL' ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.clientData = state.ClientsReducer.data;
    } else {
      returnState.clientData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === 'EXPORT_CLIENT_PROCEDURES' ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.exportProData = state.ClientsReducer.data;
    } else {
      returnState.exportProData = state.ClientsReducer.data;
    }
  }

  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({getClientDetail: getClientDetail, exportClientProcedures: exportClientProcedures}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps) (ExportProcedures);
