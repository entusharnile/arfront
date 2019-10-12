import React, { Component } from 'react';
import drilldown from 'highcharts-drilldown';
import Highcharts from 'highcharts';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { numberFormat, getCurrencySymbol } from '../../../../Utils/services.js';

drilldown(Highcharts);
class HighchartsDrilldown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      graphData:  {
        payments:[],
        time:[],
        total:0
      },
      highcharts:{}
    }

  }
  componentDidMount() {
    this.renderHighChart();
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {}
    if (nextProps.graphData != undefined && nextProps.graphData.payments != undefined && nextProps.graphData !== prevState.graphData) {
      returnState.graphData = nextProps.graphData;
      if(prevState.highcharts.series != undefined){
          let highcharts = prevState.highcharts;
          highcharts.update({
            xAxis: {
      				categories: (returnState.graphData.time != undefined) ? returnState.graphData.time : [],
      				tickLength: 0
      			},
            series: [{
      				name : 'Payment ',
      				data: (returnState.graphData.payments != undefined) ? returnState.graphData.payments : []
      			}]
          });
        }
      }
    return returnState;
  }

  renderHighChart = () => {
    let highcharts =  Highcharts.chart('container', {
      chart: {
				type: 'areaspline',
				height:150
			},
			title: {
				text: ''
			},
			exporting: {
				enabled: false
			},
			legend: {
				enabled: false
			},
			xAxis: {
				categories: this.state.graphData.time,
				tickLength: 0
			},
			yAxis: {
				title: {
					text: ''
				}
			},
			tooltip: {
				shared: true,
				valuePrefix: getCurrencySymbol(),
			},
			credits: {
				enabled: false
			},
			plotOptions: {
				areaspline: {
					fillOpacity: 0.5
				}
			},
			series: [{
				name : 'Payment ',
				data: this.state.graphData.payments
			}]
    })
    this.setState({highcharts:highcharts})
    return highcharts;
  }

  render() {
    return (
      <div>
      <div id="container">
      </div>

      </div>
    );
  }
}
class PosDashboardGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      storageData:{},
      graphData:{},
    }

  }


  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.storageData != undefined && nextProps.storageData !== prevState.graphData) {
      returnState.graphData = nextProps.storageData;
    }
    return returnState;
  }


  render() {
    return (
      <div className="dash-box-content" id="pos-dashboard-payments" data-highcharts-chart="1">
        <HighchartsDrilldown graphData={this.state.graphData} />
      </div>
    );
  }
}
function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));

  if (state.DashboardReducer.action === "FETCH_DASH_CLINICS") {



    return {

    };

  } else {
    return {};
  }
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators({
  }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(PosDashboardGraph);
