import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars';
import { numberFormat } from '../../Utils/services.js';

class DashboardTopProviders extends React.Component {
  constructor(props) {
    super (props);
    this.state={}
  }
  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem('languageData'));


    this.setState({
      dash_tbl_sales_text                 : languageData.dashboard['dash_tbl_sales_text'],
      dash_tbl_name_text                  : languageData.dashboard['dash_tbl_name_text'],
      dashboard_Top_Providers: languageData.dashboard['dashboard_Top_Providers']
    })
  }

  render() {
    return (
      <div className="dash-box" id="top-sales-outer">
        <div className="dash-box-title">{this.props.langData.dashboard_Top_Providers}</div>
        <Scrollbars style={{ height: 305 }} className="custome-scroll">
        <div className="dash-box-content top-ten-items">
          <div className="table-responsive" id="table-body-sales">
            <table className={(this.props.data.top_providers_by_sales !== undefined && this.props.data.top_providers_by_sales.length > 0) ? "table-dashboard" : 'no-display'} >
              <thead className="table-dashboard-thead" id="heading_sale">
                <tr>
                  <th className="col-xs-1 table-dashboard-th">#</th>
                  <th className="col-xs-5 table-dashboard-th">{this.state.dash_tbl_name_text}</th>
                  <th className="col-xs-3 table-dashboard-th text-right">{this.state.dash_tbl_sales_text}</th>
                </tr>
              </thead>
              <tbody id="topSales">
              {(this.props.data.top_providers_by_sales !== undefined && this.props.data.top_providers_by_sales.length > 0) &&  this.props.data.top_providers_by_sales.map((obj,idx)=>{
              return(

                <tr className="table-dashboard-tr" key={idx}>
                  <td className="col-xs-1 table-dashboard-td">{idx + 1}</td>
                  <td className="col-xs-5 table-dashboard-td">{obj.user!= null ? (obj.user.firstname+" "+obj.user.lastname) : ''}</td>
                  <td className="col-xs-3 table-dashboard-td text-right">{numberFormat(obj.total_price, 'currency')}</td>
                </tr>
              ) })}
              </tbody>
            </table>
            <p className={(this.props.data.top_providers_by_sales !== undefined && this.props.data.top_providers_by_sales.length > 0) ? "no-display" : 'dashboard-no-data'}>{this.props.langData.dashboard_No_Data_to_show}</p>
          </div>
        </div>
        </Scrollbars>
      </div>
    );
  }
}

export default DashboardTopProviders;
