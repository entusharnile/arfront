import React, { Component } from 'react';

export default class ConfirmationModal extends React.Component {
  constructor(props) {
    super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.state = {
      globalLang: languageData.global,
      confirmationAction: (props.confirmationAction) ? props.confirmationAction : '',
      confirmationMsg: (props.confirmationMsg) ? props.confirmationMsg : '',
      showConfirmationModal: (props.showConfirmationModal) ? props.showConfirmationModal : false,
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.confirmationAction !== undefined && nextProps.confirmationAction !== prevState.confirmationAction) {
      returnState.confirmationAction = nextProps.confirmationAction
    }
    if (nextProps.confirmationMsg !== undefined && nextProps.confirmationMsg !== prevState.confirmationMsg) {
      returnState.confirmationMsg = nextProps.confirmationMsg
    }
    if (nextProps.showConfirmationModal !== undefined && nextProps.showConfirmationModal !== prevState.showConfirmationModal) {
      returnState.showConfirmationModal = nextProps.showConfirmationModal
    }
    return returnState;
  }

  confirmationAction = () => {
    if (this.state.confirmationAction) {
      this.props.confirmationAction();
      this.resetConfirmation();
    } else {
      this.resetConfirmation();
    }
  }

  resetConfirmation = () => {
    this.props.onResetConfirmation({ confirmationAction: '', confirmationMsg: '', showConfirmationModal: false });
  }

  render() {
    return (
      <div className='confirmation-modal-wrapper'>
        <div className={(this.state.showConfirmationModal === true) ? 'overlay' : ''}></div>
        <div id="confirmationModal" role="dialog" className={(this.state.showConfirmationModal === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" onClick={() => this.resetConfirmation()}>×</button>
                <h4 className="modal-title">{this.state.globalLang.delete_confirmation}</h4>
              </div>
              <div className="modal-body add-patient-form filter-patient">
                {this.state.confirmationMsg}
              </div>
              <div className="modal-footer" >
                <div className="col-md-12 text-left">
                  <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={() => this.resetConfirmation()}>{this.state.globalLang.label_no}</button>
                  <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.confirmationAction}>{this.state.globalLang.label_yes}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
