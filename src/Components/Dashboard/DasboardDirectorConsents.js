import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import {numberFormat} from '../../Utils/services.js';

class DasboardDirectorConsents extends React.Component {
  constructor(props) {
    super (props);
  }
  render() {
    return (
      <div className="dash-box new-stats">
        <div className="dash-box-title">{this.props.langData.dash_pending_director_consents_text}</div>
        <div className="dash-box-content">
          <a href="/MDRooms/pending" className="view-sign">{this.props.data.dash_view_and_sign_text}</a>
          <div className="new-dash-stats pull-right" id="pending-procedure">{this.props.data.pending_procedures > 0 ? numberFormat(this.props.data.pending_procedures, 'decimal', 0) : 0}
          </div>
        </div>
      </div>
    );
  }
}

export default DasboardDirectorConsents;
