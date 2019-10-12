import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import drilldown from 'highcharts-drilldown';
import Highcharts from 'highcharts';

drilldown(Highcharts);
class SalesGoals extends Component {
  constructor(props) {
    super(props);
    this.state={

    monthData : [],
    monthValueData: []

    }

  }
componentDidMount() {
  if (this.props.data.sales_goals !== undefined ) {

    for(let key in this.props.data.sales_goals.monthly_sales_array )
    {
      this.state.monthData.push(key)
      this.state.monthValueData.push(this.props.data.sales_goals.monthly_sales_array[key])
    }
    }

    Highcharts.chart('salesGoals', {
      chart: {
              type: 'areaspline',
              height:150
            },
      title: {
          text: ''
      },

      subtitle: {
          text: ''
      },

      xAxis: {
          categories: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],
          tickLength: 0
        },
        yAxis: {
          title: {
            text: ''
          },
          plotLines: [{
            value:this.state.monthData,
            color: 'green',
            dashStyle: 'shortdash',
            width: 2,
            label: {
              text: ' '
            }
          }]
        },
      legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle'
      },
      tooltip: {
        shared: true,
        valueSuffix: 'USD',
        valuePrefix: '$'
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
                  name: '',
                  data:this.state.monthValueData,
                  marker: {
                  width: 16,
                  height: 16
                },
               }
            ],

      responsive: {
          rules: [{
              condition: {
                  maxWidth: 500
              },
              chartOptions: {
                  legend: {
                      layout: 'horizontal',
                      align: 'center',
                      verticalAlign: 'bottom'
                  }
              }
          }]
      }

  });
}
  render() {
    return (
      <div>
      <div id="salesGoals">
      </div>
      </div>
    );
  }
}
class SalesGoalsWeek extends Component {
  constructor(props) {
    super(props);
    this.state={

    weekData : [],
    weekValueData: []

    }

  }
componentDidMount() {
  if (this.props.data.sales_goals !== undefined ) {

    for(let key in this.props.data.sales_goals.weekly_sales_array)
    {
      this.state.weekData.push(key)
      this.state.weekValueData.push(this.props.data.sales_goals.weekly_sales_array[key])
    }
    }

    Highcharts.chart('salesGoalsWeek', {
      chart: {
              type: 'areaspline',
              height:150
            },
      title: {
          text: ''
      },

      subtitle: {
          text: ''
      },


            xAxis: {
        				categories: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        				tickLength: 0
        			},
        			yAxis: {
        				title: {
        					text: ''
        				},
        				plotLines: [{
                  value:this.state.weekData,
        					color: 'green',
        					dashStyle: 'shortdash',
        					width: 2,
        					label: {
        						text: ' '
        					}
        				}]
        			},
      legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle'
      },

      plotOptions: {
    				areaspline: {
    					fillOpacity: 0.5
    				}
    			},
          tooltip: {
            shared: true,
            valueSuffix: 'USD',
            valuePrefix: '$'
          },
          credits: {
            enabled: false
          },
      series: [{
          name: '',
          data: this.state.weekValueData,
          marker: {
					width: 16,
					height: 16
				},
       }
    ],

      responsive: {
          rules: [{
              condition: {
                  maxWidth: 500
              },
              chartOptions: {
                  legend: {
                      layout: 'horizontal',
                      align: 'center',
                      verticalAlign: 'bottom'
                  }
              }
          }]
      }

  });
}
  render() {
    return (
      <div>
      <div id="salesGoalsWeek">
      </div>
      </div>
    );
  }
}

class DasboardYourSalesGoals extends React.Component {
  constructor(props) {
    super (props);
    this.state={
      monthClass:'Month',
      weekClass:'Week no-display',
      buttonClassMonth:"btn btn-default graph-btn select",
      buttonClassWeek:"btn btn-default graph-btn",
      totalGoals:null

    }
  }

  handleMonth =() =>{
    let dataArr =this.props.data.sales_goals;
    if(this.props.data.sales_goals){
      this.setState({totalGoals:dataArr.monthly_sales_goal})
  }
    this.setState({weekClass:'Week no-display',
  monthClass:'Month display',
  buttonClassMonth:"btn btn-default graph-btn select",
  buttonClassWeek:"btn btn-default graph-btn"
})
  }
  handleWeek =() =>{
    let dataArr =this.props.data.sales_goals;
    if(this.props.data.sales_goals){
      this.setState({totalGoals:dataArr.weekly_sales_goal})
  }
    this.setState({monthClass:'Month no-display',
    weekClass:'Week display',
  buttonClassWeek:"btn btn-default graph-btn select",
buttonClassMonth:"btn btn-default graph-btn "
})
  }
  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem('languageData'));


    this.setState({
      dash_your_sales_goal_text           : languageData.dashboard['dash_your_sales_goal_text'],
    })
  }


  render() {

    return (
      <div className="dash-box">
        <div className="dash-box-title">{this.state.dash_your_sales_goal_text}
          <div className="btn-group graph-toggle" id="sale-group-toggle" role="group" aria-label="...">
            <button type="button" className={this.state.buttonClassMonth} id="sale-goal-monthly" onClick={this.handleMonth} data-identifier="monthy">{this.props.langData.dash_lbl_month_text}</button>
            <button type="button" className={this.state.buttonClassWeek} id="sale-goal-weekly" onClick={this.handleWeek}  data-identifier="weekly">{this.props.langData.dash_lbl_week_text}</button>
          </div>

          <span className="pull-right">{this.props.langData.dash_total_text} <b id="total-sale"></b>{this.state.totalGoals}</span>

          <div className={this.state.monthClass}>
            {this.props.data.sales_goals &&   <SalesGoals data={this.props.data}/>}

            </div>
            <div className={this.state.weekClass}>
              {this.props.data.sales_goals &&   <SalesGoalsWeek data={this.props.data}/>}

              </div>

        </div>
      </div>
    );
   }
}

export default DasboardYourSalesGoals;
