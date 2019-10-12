import React, { Component } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import { Calendar } from 'react-date-range';
import drilldown from 'highcharts-drilldown';
import Highcharts from 'highcharts';
import { Button } from 'react-dom';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { numberFormat } from '../../../Utils/services.js';
import moment from 'moment';

drilldown(Highcharts);
class HighchartsDrilldown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reportDataValues:  [
        [parseInt(moment(new Date("2018-12-10")).format('x')),30.00],
        [parseInt(moment(new Date("2018-12-11")).format('x')),40.00],
        [parseInt(moment(new Date("2018-12-14")).format('x')),70.00],
      ],
      highcharts:{},
      graphData: []
    }

  }
  componentDidMount() {
    this.renderHighChart();
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    let graphNewArr = [];
    if(nextProps.graphData.length){
    nextProps.graphData.map((obj, idx) =>{
      let labVal = obj.name;
      let labLength = labVal.length;
      obj.name =  labLength > 16 ? labVal.substring(0,15)+ '...' : labVal
      graphNewArr.push(obj);
    })
  }
    if(prevState.highcharts.series != undefined){
      let highcharts = prevState.highcharts;

      highcharts.update({
        series: [{
          "name": "Item Sales",
          "colorByPoint": true,
          "data": graphNewArr
        }]
      });
      returnState.graphData = [
	{ name: 'Botox',  y: 32.3, drilldown: null},
] ; //nextProps.graphData;
    }
    // if (nextProps.graphData != undefined && nextProps.graphData.length > 0 &&  prevState.graphData.length > 0 && nextProps.graphData !== prevState.graphData) {
    //     let highcharts = prevState.highcharts;
    //
    //     highcharts.update({
    //       series: [{
    //         "name": "Item Sales",
    //         "colorByPoint": true,
    //         "data": nextProps.graphData
    //       }]
    //     });
    //     returnState.graphData = nextProps.graphData
    // }
    return returnState;
  }

  renderHighChart = () => {
    let data = [{ name: 'yguyb',  y: 555.52, drilldown: null},{ name: 'Botox',  y: 260.7, drilldown: null}];
    let highcharts =  Highcharts.chart('container', {
    chart: {
        type: 'column',
        height: 200
    },
    title: {
        text: ''
    },
    subtitle: {
        text: 'Top 5 Items : Gross Sales '
    },
    xAxis: {
        type: 'category'
    },
    yAxis: {
        title: {
            text: ''
        }

    },
    legend: {
        enabled: false
    },
    plotOptions: {
        series: {
            borderWidth: 0,
            dataLabels: {
                enabled: true,
                format: '${point.y:.1f}'
            }
        }
    },

    tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>${point.y:.2f}</b><br/>'
    },

    "series": [
        {
            "name": "Item Sales",
            "colorByPoint": true,
            "data": this.props.graphData
        }
    ],
});

    this.setState({highcharts:highcharts})
    return highcharts;
  }

  render() {
    return (
      <div>
      <div className="category-graph category-graph-column" id="container" >
      </div>

      </div>
    );
  }
}


class ItemGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      storageData:{},
      reportDataValues:[],
    }
  }

  render() {
    let details = [{ color: '#0066B4', percent: '0.21 GB / 1.05%', name: 'Used' }, { color: '#C7E3F5', percent: '98.95 GB / 98.95%', name: 'Free' }]
    return (
      <div className="sale-graph" id="MonthChartContainer" data-highcharts-chart="0">
        <HighchartsDrilldown graphData={this.props.graphData} />
      </div>
    );
  }
}
function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  return {};
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators({
  }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(ItemGraph);
