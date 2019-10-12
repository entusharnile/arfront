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
    if(prevState.highcharts.series != undefined){
      let highcharts = prevState.highcharts;
      highcharts.update({
        series: [{
          "name": "Item Sales",
          "colorByPoint": true,
          "data": nextProps.graphData
        }]
      });
      returnState.graphData = nextProps.graphData;
    }
    return returnState;
  }

  renderHighChart = () => {
    let highcharts =  Highcharts.chart('container', {
    chart: {
        type: 'column',
        height: 200
    },
    title: {
        text: ''
    },
    subtitle: {
        text: 'Top 5 Categories : Gross Sales '
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
            "name": "Category Sales",
            "colorByPoint": true,
            "data": this.props.graphData
        }
    ],
    "drilldown": {
        "series": [
            {
                "name": "Botox",
                "id": "Botox",
                "data": [
                    [
                        "v65.0",
                        0.1
                    ],
                    [
                        "v64.0",
                        1.3
                    ],
                    [
                        "v63.0",
                        53.02
                    ],
                    [
                        "v62.0",
                        1.4
                    ],
                    [
                        "v61.0",
                        0.88
                    ],
                    [
                        "v60.0",
                        0.56
                    ],
                    [
                        "v59.0",
                        0.45
                    ],
                    [
                        "v58.0",
                        0.49
                    ],
                    [
                        "v57.0",
                        0.32
                    ],
                    [
                        "v56.0",
                        0.29
                    ],
                    [
                        "v55.0",
                        0.79
                    ],
                    [
                        "v54.0",
                        0.18
                    ],
                    [
                        "v51.0",
                        0.13
                    ],
                    [
                        "v49.0",
                        2.16
                    ],
                    [
                        "v48.0",
                        0.13
                    ],
                    [
                        "v47.0",
                        0.11
                    ],
                    [
                        "v43.0",
                        0.17
                    ],
                    [
                        "v29.0",
                        0.26
                    ]
                ]
            }
        ]
    }
});

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


class CategoryGraph extends React.Component {
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
export default connect(mapStateToProps, mapDispatchToProps)(CategoryGraph);
