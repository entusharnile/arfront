import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { checkIfPermissionAllowed } from '../../../Utils/services.js';
import { withRouter } from 'react-router';

class SalesHeader extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      globalLang: languageData.global,
      salesLang: languageData.sales,

    };
  }

  render() {
    var urlR = window.location.href;
    var res = urlR.split("/");
    let navLink = res[res.length-1];
    let midNavLink = res[res.length-2];
    return (
      <div>
          <ul className="sub-menu">
            {checkIfPermissionAllowed('view-sales-report') && <li><Link className ={(navLink == "sales" || navLink == "monthly-net-sales" || navLink == "employee-sales-report" || navLink == "payment-methods" || navLink == "item-sales" || navLink == "category-sales" || navLink == "discounts" || navLink == "taxes" || navLink == "cost-to-company" || navLink == "egift-cards" || navLink == "treatment-plans" || navLink == "short-term-liability" || navLink == "commission-report" || navLink == "memberships" || navLink == "staff-treatments" ) ? "active" : ''} to="/sales">{this.state.salesLang.sales_reports}</Link></li>}
            {checkIfPermissionAllowed('view-sales-invoices') && <li><Link className ={(navLink == "invoices") ? "active" : ''} to="/sales/invoices">{this.state.salesLang.sales_invoices}</Link></li>}
            {checkIfPermissionAllowed('view-sales-invoice-text') && <li><Link className ={(navLink == "invoice-text") ? "active" : ''} to="/sales/invoice-text">{this.state.salesLang.sales_invoice_disclaimer}</Link></li>}
            {checkIfPermissionAllowed('view-cash-drawer') && <li><Link className ={(this.props.location.pathname) ? (this.props.location.pathname.indexOf('cash') > -1) ? "active" : '' : ''} to="/sales/cash-drawer">{this.state.salesLang.sales_cash_drawer}</Link></li>}
            {checkIfPermissionAllowed('view-sales-goals') && <li><Link className ={(navLink == "office-sales-goals" || midNavLink == "office-sales-goals" || navLink == "edit" ) ? "active" : ''} to="/sales/office-sales-goals">{this.state.salesLang.sales_office_sales_goals}</Link></li>}
          </ul>
      </div>
    );
  }
}

export default withRouter(SalesHeader);
