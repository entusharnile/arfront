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
      graphData:  [
        [parseInt(moment(new Date("2018-12-10")).format('x')),30.00],
        [parseInt(moment(new Date("2018-12-11")).format('x')),40.00],
        [parseInt(moment(new Date("2018-12-14")).format('x')),70.00],
      ],
      highcharts:{}
    }

  }
  componentDidMount() {
    this.renderHighChart();
  }
  static getDerivedStateFromProps(nextProps, prevState) {

    let returnState = {}
    if (nextProps.graphData != undefined && nextProps.graphData.length > 0 &&  prevState.graphData.length > 0 && nextProps.graphData !== prevState.graphData) {
      //returnState.graphData = nextProps.graphData;
      let graphData = [];
      nextProps.graphData.map((obj,idx)=>{
        let data = [parseInt(moment(new Date(obj.p_date)).format('x')),parseFloat(obj.per_day_total)];
        graphData.push(data)
      })
      returnState.graphData = graphData;
      if(graphData.length > 0 && prevState.highcharts.series != undefined && prevState.highcharts.series.length > 0){

        let highcharts = prevState.highcharts;
        highcharts.update({
          series: [{
            type: 'area',
            name: 'USD',
            data:graphData

          }]
        });
      }
    }
    return returnState;
  }

  renderHighChart = () => {
    let highcharts =  Highcharts.chart('container', {
      chart: {
            zoomType: 'x',
            height : 200,
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: ''
            },
            min : 0,
           labels: {
                formatter: function () {
                    if(this.value < 0){
                        //return 0;
                    } else {
                        return this.value;
                    }
                },
            },
        },
        legend: {
            enabled: false
        },
        credits: {
              enabled: false
        },
        exporting: { enabled: false },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
        series: [{
            type: 'area',
            name: 'USD',
            data: this.state.graphData
        }]
    })
    this.setState({highcharts:highcharts})
    return highcharts;
  }

  render() {
    return (
      <div>
      <div className="category-graph" id="container" >
      </div>

      </div>
    );
  }
}


class SalesGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      storageData:{},
      graphData:[],
    }
  }


  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.graphData != undefined && nextProps.graphData !== prevState.graphData) {
      returnState.graphData = nextProps.graphData;
    }
    return returnState;
  }


  render() {
    let details = [{ color: '#0066B4', percent: '0.21 GB / 1.05%', name: 'Used' }, { color: '#C7E3F5', percent: '98.95 GB / 98.95%', name: 'Free' }]
    return (
      <div className="sale-graph" id="MonthChartContainer" data-highcharts-chart="0">
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
export default connect(mapStateToProps, mapDispatchToProps)(SalesGraph);
