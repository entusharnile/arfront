import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import drilldown from 'highcharts-drilldown';
import Highcharts from 'highcharts';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchClinicsDashboard } from "../../Actions/Dashboard/dashboardActions.js";
import {numberFormat} from '../../Utils/services.js';


class Pie extends Component {
  constructor(props) {
    super(props);
    this.state={
    dashOfficeGoalsList:[],
    customersData:[],
    yData:null,
    zData:null,
    y:60

    }}
componentDidMount() {



let curData = 0,
    datay = 0,
    dataz = 0;
if(this.props.data.returning_customers !== undefined){
 let xxx = this.props.data.returning_customers;
   curData = this.props.data.returning_customers
   datay = this.props.data.returning_customers.new_percentage
   dataz = this.props.data.returning_customers.returned_percentage
  {/*let datay=numberFormat(this.props.data.returning_customers.new_percentage)
  let dataz=numberFormat(this.props.data.returning_customers.returned_percentage)*/}

  this.setState({yData:datay, zData: dataz});
}



    // Create the chart
    Highcharts.chart('container-fluid', {
        chart: {
            type: 'pie',
            margin: [-10, 80, 50, 190],
    				height: 380,
    				width: 430,
    				backgroundColor:'rgba(255, 255, 255, 0.0)'
        },
        title: {
            text: 'RETURNING CUSTOMERS'
        },
        tooltip: {
            headerFormat: '',
            pointFormat: 'Returning Customers<br/>' +
                'Percentage (%): <b>{point.y}</b>%<br/>'
        },
        plotOptions: {
               pie: {
                   allowPointSelect: true,
                   cursor: 'pointer',
                   dataLabels: {
                       enabled: false,
                   }
               }
           },

                series: [{
                    minPointSize: 10,
                    innerSize: '70%',
                    zMin: 0,
                    name: 'countries',
                  data:[{
                           name: 'Returning Customers',
                           y:dataz,
                           z: dataz,
                           color: '#2682c5'
                         }, {
                           name: 'New Customers',
                           y: datay,
                           z: datay,
                           color: '#bec3c8'
                         }],

                }]
    });


}
  render() {

    return (
      <div>
      <div id="container-fluid">
      </div>

      </div>
    );
  }
}

class DashboardReturningCustomers extends React.Component {
  constructor(props) {
    super (props);
    this.state={
      total_patients_data:null
    }
  }
  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem('languageData'));


    this.setState({
      dash_returning_customers_text       : languageData.dashboard['dash_returning_customers_text'],
    })
  }

  render() {
let rc = this.props.data.returning_customers;
    return (
      <div className="dash-box">
        <div className="dash-box-title">{this.state.dash_returning_customers_text}</div>
          <div className="sales-date-price Returning-date-price">
            <span className="sale-goal-price" id="return-cust-center">{(this.props.data.returning_customers) ? this.props.data.returning_customers.total_patients : ''}</span>
            <span className="sale-goal-date" id="return-cust-title">{this.props.langData.dash_customers_text}</span>
          </div>
          <div className="dash-box-content" id="returning-customers" data-highcharts-chart="0">
            <div id="highcharts-h18k2i3-2" className="highcharts-container " data-highcharts-chart="0"
            style={{position: 'relative', overflow: 'hidden', width: '400px',
            height: '200px', textAlign: 'left', lineHeight: 'normal', zIndex: '0',
            WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)'}}>
            { this.props.data.office_sales_goals && <Pie data={this.props.data}/> }
            </div>
          </div>
          <div className="Returning-legend">
            {(this.props.data.returning_customers !== undefined) ?
                <div className="legend-group" >
                    <div className="Returning-outer newCustomer">
                      <div className="legend-dot" ></div>
                      <div className="legend-price"><b>{this.props.data.returning_customers.total_new_patients} / {this.props.data.returning_customers.new_percentage} %</b></div>
                      <div className="legend-clinic">{this.props.langData.dashboard_New_Customers}</div>
                    </div>
                    <div className="Returning-outer">
                      <div className="legend-dot" ></div>
                      <div className="legend-price"><b>{this.props.data.returning_customers.total_returned_patients} / {numberFormat(this.props.data.returning_customers.returned_percentage)} %</b></div>
                      <div className="legend-clinic">{this.props.langData.dashboard_Returned_Customers}</div>
                    </div>

                </div>


              : ''}
          </div>
        </div>
      );
   }
}
function mapStateToProps(state){
  const languageData = JSON.parse(localStorage.getItem('languageData'));

  if (state.DashboardReducer.action === "FETCH_DASH_CLINICS") {



    return {

    };

  } else {
    return {};
  }
}
function mapDispatchToProps(dispatch){
  return bindActionCreators({
    fetchClinicsDashboard:fetchClinicsDashboard
},dispatch)
}
export default connect(mapStateToProps,mapDispatchToProps)(DashboardReturningCustomers);
