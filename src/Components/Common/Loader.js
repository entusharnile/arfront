import React, { Component } from 'react';
export default class Loader extends React.Component {
  constructor(props) {
    super(props);
      const languageData = JSON.parse(localStorage.getItem('languageData'));
      this.state = {
        Please_Wait: (languageData.global)  ? ((languageData.global.Please_Wait) ? languageData.global.Please_Wait : '') : ''
      }
    }
  render() {    
    return (
      <div className={(this.props.showLoader) ? ((this.props.isFullWidth) ? 'new-loader text-left full-fixed-loader displayBlock' : 'new-loader text-left displayBlock' ) : 'new-loader text-left'}>
        <div className="loader-outer">
          <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
          <div id="modal-confirm-text" className="popup-subtitle" >{this.state.Please_Wait}</div>
        </div>
      </div>
    )
  }
}
