import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import drilldown from 'highcharts-drilldown';
import Highcharts from 'highcharts';

drilldown(Highcharts);
class ProcedureGoals extends Component {
  constructor(props) {
    super(props);
    this.state={
      monthData : [],
      monthValueData: []
    }
  }
  componentDidMount() {
  if (this.props.data.procedure_goals !== undefined ) {
    for(let key in this.props.data.procedure_goals.monthly_procedure_array )
    {
      this.state.monthData.push(key)
      this.state.monthValueData.push(this.props.data.procedure_goals.monthly_procedure_array[key])
    }
  }

  Highcharts.chart('procedureGoals', {
    chart: {
      type: 'areaspline',
      height: 150
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
      tooltip: {
        shared: true,
        valueSuffix:  'Procedures'
      },
      credits: {
        enabled: false
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
        <div id="procedureGoals">
        </div>
      </div>
    );
  }
}

class ProcedureGoalsWeek extends Component {
  constructor(props) {
    super(props);
    this.state={
      weekData : [],
      weekValueData: []
    }
  }
  componentDidMount() {
  if (this.props.data.procedure_goals !== undefined ) {
    for(let key in this.props.data.procedure_goals.weekly_procedure_array )
      {
        this.state.weekData.push(key)
        this.state.weekValueData.push(this.props.data.procedure_goals.weekly_procedure_array[key])
      }
    }

    Highcharts.chart('procedureGoalsWeek', {
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
      legend: {
        enabled: false
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
        tooltip: {
          shared: true,
          valueSuffix: ' Procedures'
        },
        credits: {
          enabled: false
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
        <div id="procedureGoalsWeek">
        </div>
      </div>
    );
  }
}

class DasboardProcedureGoals extends React.Component {
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
  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.setState({
      /*
      dash_filter_btn_text                : languageData.dashboard['dash_filter_btn_text'],
      dash_filter_custom_text             : languageData.dashboard['dash_filter_custom_text'],
      dash_filter_last_30_days_text       : languageData.dashboard['dash_filter_last_30_days_text'],
      dash_filter_last_month_text         : languageData.dashboard['dash_filter_last_month_text'],
      dash_filter_last_week_text          : languageData.dashboard['dash_filter_last_week_text'],
      dash_filter_last_year_text          : languageData.dashboard['dash_filter_last_year_text'],
      dash_filter_this_month_text         : languageData.dashboard['dash_filter_this_month_text'],
      dash_filter_this_week_text          : languageData.dashboard['dash_filter_this_week_text'],
      dash_filter_this_year_text          : languageData.dashboard['dash_filter_this_year_text'],
      dash_filter_yesterday_text          : languageData.dashboard['dash_filter_yesterday_text'],
      dash_greet_by_text                  : languageData.dashboard['dash_greet_by_text'],
      dash_in_office_sales_goals_text     : languageData.dashboard['dash_in_office_sales_goals_text'],
      dash_matics_text                    : languageData.dashboard['dash_matics_text'],
      dash_net_promoter_score_text        : languageData.dashboard['dash_net_promoter_score_text'],
      dash_pending_director_consents_text : languageData.dashboard['dash_pending_director_consents_text'],
      dash_procedure_audit_text           : languageData.dashboard['dash_procedure_audit_text'],
      dash_returning_customers_text       : languageData.dashboard['dash_returning_customers_text'],
      dash_view_and_sign_text             : languageData.dashboard['dash_view_and_sign_text'],
      dash_your_gross_sales_text          : languageData.dashboard['dash_your_gross_sales_text'],
      dash_your_procedures_text           : languageData.dashboard['dash_your_procedures_text'],
      dash_your_sales_goal_text           : languageData.dashboard['dash_your_sales_goal_text'],
      dash_your_survey_scores_text        : languageData.dashboard['dash_your_survey_scores_text'],
      dash_your_top_10_items_by_sales     : languageData.dashboard['dash_your_top_10_items_by_sales'],
      dash_customers_text                 : languageData.dashboard['dash_customers_text'],
      dash_no_score_yet_text              : languageData.dashboard['dash_no_score_yet_text'],
      dash_tbl_units_text                 : languageData.dashboard['dash_tbl_units_text'],
      dash_tbl_sales_text                 : languageData.dashboard['dash_tbl_sales_text'],
      dash_tbl_name_text                  : languageData.dashboard['dash_tbl_name_text']
      */
      dash_total_text                     : languageData.dashboard['dash_total_text'],
      dash_your_procedure_goal_text       : languageData.dashboard['dash_your_procedure_goal_text'],
      dash_lbl_month_text                 : languageData.dashboard['dash_lbl_month_text'],
      dash_lbl_week_text                  : languageData.dashboard['dash_lbl_week_text'],
    })
  }

  handleMonth =() =>{
    let dataArr =this.props.data.procedure_goals;
    if(this.props.data.procedure_goals){
      this.setState({totalGoals:dataArr.monthly_procedure_goal})
    }
    this.setState({weekClass:'Week no-display',
    monthClass:'Month display',
    buttonClassMonth:"btn btn-default graph-btn select",
    buttonClassWeek:"btn btn-default graph-btn"})
  }

  handleWeek =() =>{
    let dataArr =this.props.data.procedure_goals;
    if(this.props.data.procedure_goals){
      this.setState({totalGoals:dataArr.weekly_procedure_goal})
    }

    this.setState({monthClass:'Month no-display',
    weekClass:'Week display',
    buttonClassWeek:"btn btn-default graph-btn select",
    buttonClassMonth:"btn btn-default graph-btn "})
  }

  render() {
    return (
      <div className="dash-box">
        <div className="dash-box-title">{this.state.dash_your_procedure_goal_text}
          <div className="btn-group graph-toggle" id="pro-group-toggle" role="group" aria-label="...">
            <button type="button" className={this.state.buttonClassMonth} id="procedure-goal-monthly" onClick={this.handleMonth} data-identifier="monthy" >{this.props.langData.dash_lbl_month_text}</button>
            <button type="button" className={this.state.buttonClassWeek} id="procedure-goal-weekly" onClick={this.handleWeek} data-identifier="weekly">{this.props.langData.dash_lbl_week_text}</button>
          </div>
          <span className="pull-right">{this.state.dash_total_text} <b id="total-pro">{this.state.totalGoals}</b></span>
          <div className={this.state.monthClass}>
            {this.props.data.procedure_goals &&   <ProcedureGoals data={this.props.data}/>}
          </div>
          <div className={this.state.weekClass}>
            {this.props.data.procedure_goals && <ProcedureGoalsWeek data={this.props.data}/>}
          </div>
        </div>
      </div>
    );
  }
}

export default DasboardProcedureGoals;
