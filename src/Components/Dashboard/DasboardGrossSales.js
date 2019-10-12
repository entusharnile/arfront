import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import {numberFormat} from '../../Utils/services.js';


class DasboardGrossSales extends React.Component {
  constructor(props) {
    super (props);
    this.state={

    }
  }
  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem('languageData'));


    this.setState({
      dash_your_gross_sales_text          : languageData.dashboard['dash_your_gross_sales_text']
    })
  }



  render() {
    return (
      <div className="dash-box new-stats">
        <div className="dash-box-title">{this.state.dash_your_gross_sales_text}</div>
        <div className="dash-box-content">
          <div className="new-dash-stats position-left" id="gross-sale">{parseInt(this.props.data.total_gross_sales) > 0 ? numberFormat(this.props.data.total_gross_sales, 'currency', 2) : numberFormat(0, 'currency', 2)}</div>
        </div>
      </div>
    );
   }
}

export default DasboardGrossSales;
