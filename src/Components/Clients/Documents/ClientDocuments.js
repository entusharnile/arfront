import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { getClientDocuments, deleteClientDocument, exportEmptyData } from '../../../Actions/Clients/clientsAction.js';
import { capitalizeFirstLetter,showFormattedDate } from '../../../Utils/services.js';
import { ToastContainer, toast } from "react-toastify";


class ClientDocuments extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState;
  }

  get initialState() {
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    return {
      clientsLang: languageData.clients,
      globalLang: languageData.global,
      showLoader: false,
      backURLType: (this.props.match.params.actionType) ? this.props.match.params.actionType : 'clients',
      clientID: this.props.match.params.clientID,
      actionType: (this.props.match.params.actionType) ? this.props.match.params.actionType : 'profile',
      isRender: false,
      isShowDeleteModal:false,
      deletedDocumentId: 0, // use for deletetion, updation

      documentData:  {},
      documentList: [],
      clientName:''
    };
  }

  componentDidMount() {
    this.setState({'showLoader':true})
    let isRender = false;
    let clientID = this.props.match.params.clientID;
    if(clientID == undefined) {
      clientID = 0;
      isRender=true;
    }
    let actionType = this.props.match.params.type;
    if(actionType == undefined) {
      actionType = '';
    }
    this.setState({clientID:clientID,actionType:actionType,isRender:isRender})
    if(clientID){
      const formData ={
        params:{
          patient_id:clientID
        }
      }
      this.props.getClientDocuments(formData)
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if(nextProps.documentData !== undefined && nextProps.documentData !== prevState.documentData){
      nextProps.exportEmptyData()
      returnState.documentData = nextProps.documentData
      returnState.documentList = nextProps.documentData.documents
      returnState.clientName = (nextProps.documentData.client_name) ? capitalizeFirstLetter(nextProps.documentData.client_name) : ''
      returnState.showLoader = false
      returnState.deletedDocumentId = 0
    } else if(nextProps.showLoader !== undefined && nextProps.showLoader === false){
      nextProps.exportEmptyData()
      returnState.showLoader = false
    }
    return returnState
  }

  AddClientDocuments = () => {
    return (
      <div>
        {this.props.history.push(`/clients/documents/add/${this.state.clientID}/profile`)}
      </div>
    )
  }
  EditClientDocuments = (id) => {
    return (
      <div>
        {this.props.history.push(`/clients/documents/edit/${id}/${this.state.clientID}/profile`)}
      </div>
    )
  }

  handleDeleteDocument = () => {
    this.toggleState('isShowDeleteModal')
    if(this.state.deletedDocumentId){
      this.setState({showLoader:false})
      this.props.deleteClientDocument(this.state.deletedDocumentId)
    }
  }

  handleDownloadDocument = (downloadPath) => {
    if(downloadPath){
      window.open(downloadPath)
    }

  }

  // key type of boolean
  toggleState = (key) => {
      this.setState({[key]: !this.state[key]})
  }

  render() {
    let returnUrl = '';

    if ( this.state.backURLType && this.state.backURLType === 'clients' ) {
      returnUrl = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID  : "/" + this.state.backURLType
    } else {
    }

    return (
      <div id="content" className="content-client-documents">
        <div className="container-fluid content setting-wrapper">
          <div className="juvly-section full-width m-t-15">
            <div className="juvly-container">
          		{(this.state.showLoader === false) && <div className="juvly-title m-b-0">{this.state.clientName} - {this.state.clientsLang.client_mangae_document}
          			<Link to={returnUrl} className="pull-right crossIcon"><img src="/images/close.png"/></Link>
                <a  className="new-blue-btn pull-right" onClick={() =>this.AddClientDocuments()} >{this.state.clientsLang.client_add_document}</a>
          		</div>}
          	</div>

            <div className="table-responsive">
              <table className="table-updated juvly-table min-w-1000 no-hover flex-wrap">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-4 table-updated-th text-ellipsis">{this.state.clientsLang.client_document}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.clientsLang.client_document_type}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.clientsLang.client_visits}</th>
                    <th className="col-xs-4 table-updated-th">{this.state.clientsLang.client_actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {(this.state.documentList.length > 0) ?
                    this.state.documentList.map((obj,idx) => {
                      return (
                        <tr key={'documentList'+idx} className="table-updated-tr">
                          <td className="col-xs-4 table-updated-td text-ellipsis">{obj.document_name}</td>
                          <td className="col-xs-2 table-updated-td">{obj.document_type}</td>
                          <td className="col-xs-2 table-updated-td">{(obj.appointment !== null && obj.appointment !== undefined && obj.appointment.appointment_datetime !== undefined) ? showFormattedDate(obj.appointment.appointment_datetime,true) : 'N/A'}</td>
                          <td className="col-xs-4 table-updated-td">
                            <a href="javascript:void(0);" className="easy-link" onClick={() =>this.EditClientDocuments(obj.id)}>{this.state.globalLang.label_edit}</a>
                            <a href="javascript:void(0);" className="easy-link"
                              onClick={() => {this.setState({isShowDeleteModal: !this.state.isShowDeleteModal, deletedDocumentId:obj.id})}}>{this.state.globalLang.label_delete}</a>
                            <a href="javascript:void(0);" className="easy-link" onClick={() =>this.handleDownloadDocument(obj.download_path)}>{this.state.globalLang.label_download}</a>
                          </td>
                        </tr>
                      )
                    })
                    :
                    <tr className="table-updated-tr">
                        <td className="col-xs-12 table-updated-td text-center" colSpan={5}>{this.state.globalLang.sorry_no_record_found}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            {/* Delete Document Modal - START */}
            <div className={(this.state.isShowDeleteModal === true ) ? 'overlay' : ''}></div>
            <div id="filterModal" role="dialog" className={(this.state.isShowDeleteModal === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
               <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" onClick={this.toggleState.bind(this,'isShowDeleteModal')}>×</button>
                      <h4 className="modal-title">{this.state.globalLang.delete_confirmation}</h4>
                    </div>
                    <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                      {this.state.clientsLang.client_delete_document_confirmation_msg}
                    </div>
                    <div className="modal-footer" >
                      <div className="col-md-12 text-left">
                        <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.toggleState.bind(this,'isShowDeleteModal')}>{this.state.globalLang.label_no}</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.handleDeleteDocument}>{this.state.globalLang.label_yes}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Delete Document Modal - END */}
          </div>
          <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock clientLoader' : 'new-loader text-left'}>
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
  if (state.ClientsReducer.action === "CLIENT_DOCUMENT_LIST") {
    if(state.ClientsReducer.data.status != 200) {
      toast.dismiss()
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.documentData = state.ClientsReducer.data.data
    }
  } else if (state.ClientsReducer.action === "CLIENT_DOCUMENT_DELETE") {
    if(state.ClientsReducer.data.status != 200) {
      toast.dismiss()
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.showLoader = false
    } else {
      toast.dismiss()
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.documentData = state.ClientsReducer.data.data
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getClientDocuments: getClientDocuments,
    deleteClientDocument: deleteClientDocument,
    exportEmptyData:exportEmptyData
   }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ClientDocuments));
