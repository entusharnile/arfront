import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import {numberFormat} from '../../Utils/services.js';

class DasboardYourProcedures extends React.Component {
  constructor(props) {
    super (props);
    this.state={

    }
  }
  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem('languageData'));


    this.setState({
      dash_your_procedures_text           : languageData.dashboard['dash_your_procedures_text']
    })
  }

  render() {
    return (
      <div className="dash-box new-stats">
        <div className="dash-box-title">{this.state.dash_your_procedures_text}</div>
        <div className="dash-box-content">
          <div className="new-dash-stats position-left" id="total-procedure">{this.props.data.total_procedures > 0 ? numberFormat(this.props.data.total_procedures, 'decimal', 0) : 0}</div>
        </div>
      </div>
    );
   }
}

export default DasboardYourProcedures;
