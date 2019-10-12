import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import {numberFormat} from '../../Utils/services.js';

class DasboardProcedureAudits extends React.Component {
  constructor(props) {
    super (props);
  }

  render() {
    return (
      <div className="dash-box new-stats">
        <div className="dash-box-title">{this.props.langData.dash_procedure_audit_text}</div>
        <div className="dash-box-content">
          <Link to="/provider-room/pending" className="view-sign">{this.props.langData.dash_view_and_sign_text}</Link>
          <div className="new-dash-stats pull-right" id="procedure-audit">{parseInt(this.props.data.procedures_not_sent) > 0 ? numberFormat(this.props.data.procedures_not_sent, 'decimal', 0) : 0}</div>
        </div>
      </div>
    );
   }
}

export default DasboardProcedureAudits;
