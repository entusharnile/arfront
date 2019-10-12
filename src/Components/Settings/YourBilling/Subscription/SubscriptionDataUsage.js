import React, { Component } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import { Calendar } from 'react-date-range';
import drilldown from 'highcharts-drilldown';
import Highcharts from 'highcharts';
import { Button } from 'react-dom';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { numberFormat } from '../../../../Utils/services.js';

drilldown(Highcharts);
class HighchartsDrilldown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      graphData:  [{
        name: 'Used',
        y: 1.05,
        color: '#0066B4',
        z: '0.21 GB / 1.05%'
      }, {
        name: 'Free',
        y: 98.95,
        color: '#C7E3F5',
        z: '19.79 GB / 98.95%'
      }],
      highcharts:{}
    }

  }
  componentDidMount() {
    this.renderHighChart();
  }
  static getDerivedStateFromProps(nextProps, prevState) {

    let returnState = {}
    if (nextProps.graphData != undefined && nextProps.graphData.length > 0 && nextProps.graphData !== prevState.graphData) {
      returnState.graphData = nextProps.graphData;
      if(prevState.highcharts.series != undefined && prevState.highcharts.series.length > 0){

        let highcharts = prevState.highcharts;
        highcharts.update({
          series: [{
            name: 'Versions',
            data: nextProps.graphData,
            size: '90%',
            innerSize: '80%',

            id: 'versions',
            showInLegend: false
          }]
        });
      }
    }
    return returnState;
  }

  renderHighChart = () => {
    let highcharts =  Highcharts.chart('container', {
      chart: {
        type: 'pie',
        margin: [25, 80, 50, 0],
        height: 300,
        width: 385,
        backgroundColor: 'rgba(255, 255, 255, 0.0)'
      },
      title: {
        text: ' '
      },
      subtitle: {
        text: ' '
      },
      spacingBottom: 0,
      height: 250,
      exporting: { enabled: false },
      xAxis: {
        labels:
        {
          enabled: false
        }
      },
      yAxis: {
        title: {
          text: 'Total percent market share'
        },
        labels:{
            enabled: false
          }
      },
      plotOptions: {
        pie: {
          shadow: false,
          center: ['50%', '50%'],
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false,
          }
        }
      },
      series: [{
        name: 'Versions',
        data: this.state.graphData,
        size: '90%',
        innerSize: '80%',

        id: 'versions',
        showInLegend: false
      }],
      legend: {
          enabled: true,
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle', padding: 3,
          itemMarginTop: 5,
          itemMarginBottom: 5,
          itemStyle: {
            lineHeight: '14px'
          },
          x: -5,
          y:20,
          useHTML: true,
          labelFormatter: function() {
            return '<div class="setting-data-usage">' + this.z + '</div><div class="setting-free-used">' + this.name + '</div>';
          }
        },
      tooltip: {
        valueSuffix: ' GB'
      },
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
class SubscriptionDataUsage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      storageData:{},
      graphData:[],
    }

  }


  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.storageData != undefined && nextProps.storageData !== prevState.storageData) {
      returnState.storageData = nextProps.storageData;
    }
    if (nextProps.storageData != undefined && nextProps.storageData.graph != undefined && nextProps.storageData.graph !== prevState.graphData) {
      returnState.graphData = nextProps.storageData.graph;
    }

    return returnState;
  }


  render() {
    let details = [{ color: '#0066B4', percent: '0.21 GB / 1.05%', name: 'Used' }, { color: '#C7E3F5', percent: '98.95 GB / 98.95%', name: 'Free' }]
    return (
      <div className="dash-box">
        <div className="dash-box-title"></div>
        <div className="sales-date-price">
          <span className="sale-goal-date">{this.state.storageData.used+'/'+this.state.storageData.limit+" GB"}</span>
          <span className="sale-goal-price">{"Total"}</span>
        </div>
        <div className="dash-box-content office-goal" id="office-sales-goals" data-highcharts-chart="6">
          <div id="container" className="highcharts-container " data-highcharts-chart="6"
            style={{
              position: 'relative', overflow: 'hidden', width: '375px',
              height: '300px', textAlign: 'left', lineHeight: 'normal', zIndex: '0',
              WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)'
            }}>
            <HighchartsDrilldown graphData={this.state.graphData} />
          </div>
        </div>
        <div className="sales-goal-legend">
          {this.state.graphData.map((obj, idx) => {
            return (
              <div className="legend-group" key={idx}>
                <div className="legend-dot" style={{ background: obj.color }}></div>
                <div className="legend-price">{obj.z}</div>
                <div className="legend-clinic">{obj.name}</div>
              </div>
            )
          })}
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionDataUsage);
