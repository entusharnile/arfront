import React, { Component } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import { Calendar } from 'react-date-range';
import drilldown from 'highcharts-drilldown';
import Highcharts from 'highcharts';
import {Button} from 'react-dom';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchClinicsDashboard } from "../../Actions/Dashboard/dashboardActions.js";
import {numberFormat} from '../../Utils/services.js';

drilldown(Highcharts);
class HighchartsDrilldown extends Component {
  constructor(props) {
    super(props);
    this.state={
    dashOfficeGoalsList:[],
    returningData : [],


    }
  }
componentDidMount() {
    // Create the chart

    var colors = this.props.data.colors;

    if ( this.props.data.office_sales_goals !== undefined && this.props.data.office_sales_goals.clinic_goals_array !== undefined && this.props.data.office_sales_goals.clinic_goals_array.length > 0 ) {
      for ( let i = 0; i < this.props.data.office_sales_goals.clinic_goals_array.length; i++ ) {
        let curArray = this.props.data.office_sales_goals.clinic_goals_array[i]
        let tempArray    = {name: curArray.clinic_color,
          y: curArray.y,
          z: curArray.z,
          clinic_percentage: numberFormat(curArray.clinic_percentage),
          clinic_name: curArray.clinic_name,
          clinic_goal: numberFormat(curArray.clinic_goal)}
        this.state.returningData.push(tempArray)
      }
    }

    // Create the chart
    Highcharts.chart('container', {
      chart: {
            type: 'pie',
            margin: [25, 80, 50, 50],
    				height: 300,
    				width: 385,
    				backgroundColor:'rgba(255, 255, 255, 0.0)'
        },
        colors: colors,

        title: {
            text: 'IN OFFICE SALES GOALS'
        },

        tooltip: {

            pointFormat: 'Clinic Name :<span style="name:{point.clinic_name}"></span> <b> {point.clinic_name}</b><br/>' +
                'Percentage (%): <b>{point.clinic_percentage}</b>%<br/>' +
                'Goal ($): <b>${point.clinic_goal}</b><br/>'
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

            data: this.state.returningData
        }]
    })
  }
  render() {
    let returnData = '';
        {this.props.data.office_sales_goals !== undefined && this.props.data.office_sales_goals.clinic_goals_array !== undefined && this.props.data.office_sales_goals.clinic_goals_array.length > 0 && this.props.data.office_sales_goals.clinic_goals_array.map((obj,idx,returningData)=>{
          return(  {
                    "y": obj.y,
                    "z": obj.z,
                    "color":obj.clinic_color,
                    "clinic_name":obj.clinic_name,
                    "clinic_percentage": obj.clinic_percentage
                }
          )})}

    return (
      <div>
      <div id="container">
      </div>

      </div>
    );
  }
}
class DashboardSalesGoals extends React.Component {
  constructor(props) {
		super(props);
    this.state={

    }
	}

  componentDidMount() {
    this.props.fetchClinicsDashboard()
  }

  static getDerivedStateFromProps(props, state) {
    if (props.office_sales_goals !== undefined && props.office_sales_goals.status === 200 && state.office_sales_goals.clinic_goals_array.data != props.office_sales_goals.clinic_goals_array.data) {
      return {
        clinic_name: props.clinic_name,
        showLoader : false,
      };
      }
      else
        return null;
  }

  render() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    var date = new Date();
    let month =  date.getMonth();
    let year = date.getFullYear();
    if(this.props.data.office_sales_goals !== undefined){
    for(let key in this.props.data.returning_customers ){
      let off = this.props.data.office_sales_goals;
      this.props.data.total_clinic_goals=off.total_clinic_goals
    }
}

    return (
        <div className="dash-box">
            <div className="dash-box-title">{this.props.langData.dash_in_office_sales_goals_text}</div>
              <div className="sales-date-price">
                <span className="sale-goal-date">{monthNames[month] + ' '+ year}</span>
                <span className="sale-goal-price">{numberFormat(this.props.data.total_clinic_goals, 'currency', 2)}</span>
              </div>
              <div className="dash-box-content office-goal" id="office-sales-goals" data-highcharts-chart="6">
                <div id="container" className="highcharts-container " data-highcharts-chart="6"
                style={{position: 'relative', overflow: 'hidden', width: '375px',
                height: '300px', textAlign: 'left', lineHeight: 'normal', zIndex: '0',
                WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)'}}>

                { this.props.data.office_sales_goals && <HighchartsDrilldown data={this.props.data} /> }

                </div>
            </div>
            <div className="sales-goal-legend">
            {this.props.data.office_sales_goals !== undefined && this.props.data.office_sales_goals.clinic_goals_array !== undefined && this.props.data.office_sales_goals.clinic_goals_array.length > 0 && this.props.data.office_sales_goals.clinic_goals_array.map((obj,idx)=>{
              return(
              <div className="legend-group" key={idx}>
                <div className="legend-dot" style={{background:'#005a8d'}}></div>
                <div className="legend-price">{obj.goal_percent}</div>
                <div className="legend-clinic">{obj.clinic_name}</div>
              </div>
            )
            })}
          </div>
      </div>
    );
  }
}

function mapStateToProps(state){
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.DashboardReducer.action === "FETCH_DASH_CLINICS") {
    if (state.DashboardReducer.data.status === 200) {
      return {
  			OfficeSalesGoalsList: state.DashboardReducer.data
      };
    }
  }
  else {
    return {};
  }
}

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    fetchClinicsDashboard:fetchClinicsDashboard
  },dispatch)
}

export default connect(mapStateToProps,mapDispatchToProps)(DashboardSalesGoals);
