import React, { Component } from 'react';
import { Link } from "react-router-dom";

class SalesSidebar extends Component {
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
    return (
      <div>
        <ul className="new-setting-tabs salestab">
          <li className="new-setting-tabs-li">
            <Link className ={(navLink == this.state.salesLang.sales_nav) ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '} to="/sales"><i className="fas fa-angle-right" />{this.state.salesLang.sales_summary}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className ={(navLink == this.state.salesLang.sales_monthly_net_sales_nav) ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '} to="/sales/monthly-net-sales"><i className="fas fa-angle-right" />{this.state.salesLang.sales_monthly_net_sales}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className={(navLink == this.state.salesLang.sales_employee_sales_report_nav) ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '} to="/sales/employee-sales-report"><i className="fas fa-angle-right" />{this.state.salesLang.sales_employee_sales}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className ={(navLink == this.state.salesLang.sales_payment_methods_nav) ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '} to="/sales/payment-methods"><i className="fas fa-angle-right" />{this.state.salesLang.sales_payment_methods}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className={(navLink ==this.state.salesLang.sales_item_sales_nav) ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '} to="/sales/item-sales"><i className="fas fa-angle-right" />{this.state.salesLang.sales_Item_Sales}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className={(navLink == this.state.salesLang.sales_category_sales_nav) ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '} to="/sales/category-sales"><i className="fas fa-angle-right" />{this.state.salesLang.sales_category_sales}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className={(navLink == this.state.salesLang.sales_discounts_nav) ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '}  to="/sales/discounts"><i className="fas fa-angle-right" />{this.state.salesLang.sales_discounts}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className={(navLink == this.state.salesLang.sales_taxes_nav) ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '} to="/sales/taxes"><i className="fas fa-angle-right" />{this.state.salesLang.sales_taxes}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className={(navLink == this.state.salesLang.sales_cost_to_company_nav) ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '}  to="/sales/cost-to-company"><i className="fas fa-angle-right" />{this.state.salesLang.sales_cost_to_company}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className={(navLink == this.state.salesLang.sales_egift_cards_nav) ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '} to="/sales/egift-cards"><i className="fas fa-angle-right" />{this.state.salesLang.sales_egift_cards}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className={(navLink == this.state.salesLang.sales_treatment_plans_nav) ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '} to="/sales/treatment-plans"><i className="fas fa-angle-right" />{this.state.salesLang.sales_treatment_plans}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className={(navLink == this.state.salesLang.sales_short_term_liability_nav) ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '} to="/sales/short-term-liability"><i className="fas fa-angle-right" />{this.state.salesLang.sales_short_term_liability}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className={(navLink == this.state.salesLang.sales_commission_report_nav) ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '} to="/sales/commission-report"><i className="fas fa-angle-right" />{this.state.salesLang.sales_commision_report}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className={(navLink == this.state.salesLang.sales_memberships_nav) ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '} to="/sales/memberships"><i className="fas fa-angle-right" />{this.state.salesLang.sales_membership}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className={(navLink == this.state.salesLang.sales_staff_treatments_nav) ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '} to="/sales/staff-treatments"><i className="fas fa-angle-right" />{this.state.salesLang.sales_staff_treatment}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className={(navLink == 'membership-churn-report') ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '} to="/sales/membership-churn-report"><i className="fas fa-angle-right" />{this.state.salesLang.sales_membership_churn_report}</Link>
          </li>
          <li className="new-setting-tabs-li">
            <Link className={(navLink == 'tips-per-provider') ? "new-setting-tabs-a active-menu" : 'new-setting-tabs-a '} to="/sales/tips-per-provider"><i className="fas fa-angle-right" />{this.state.salesLang.sales_tips_per_provider}</Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default SalesSidebar;
