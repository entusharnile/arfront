import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import InputMask from 'react-input-mask';
import { convertTime12to24, convertTime24to12, getAmPm,handleScheduleMasking } from '../../../Utils/services.js';

const initSchedule = () => {
  return {
    from_time:"00:00",
    from_time_option:"AM",
    from_time_24 : '00:00',
    to_time:"00:00",
    to_time_option:"PM",
    to_time_24 : '00:00',
    className : {
      from_time:"setting-input-box hours-time from-time-input",
      from_time_option:"newSelectField hours-pm from_time_option",
      to_time:"setting-input-box hours-time to-time-input",
      to_time_option:"newSelectField hours-pm to_time_option",
    }
  }
}

class WeekScheduleHours extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            index:null,
            isChecked:false,
            schedules:[initSchedule()],
            dayValue : {
              day : 0,
              name : '',
              is_checked : false,
              schedules: [initSchedule()],
            },
            dayValueData: {},
        }

    }
    static getDerivedStateFromProps(props, state) {
      let returnState = {}
      if(props.showLoader != undefined && props.showLoader == false) {
          return {showLoader : false};
       }
      if(props.dayValue !== undefined && props.dayValue.schedules != undefined && props.dayValue.schedules != state.schedules){
        returnState.index = props.index;
        returnState.dayValueData = props.dayValue;
        returnState.schedules = props.dayValue.schedules;
        let dayValue = {};
        dayValue.day = props.dayValue.day;
        dayValue.name = props.dayValue.name;
        dayValue.is_checked = props.dayValue.is_checked;
        dayValue.schedules = (state.userChanged) ? state.dayValue.schedules : props.dayValue.schedules;
        returnState.dayValue = dayValue;
        return returnState;
      }
      return null
    }

    handleChange = (event) => {
      let dayValue = this.state.dayValue;
      const target = event.target;
      let value= target.value;
      let inputName = target.name;
      const  surveyindex = event.target.dataset.surveyindex;
      if(target.type == 'checkbox'){
        value = (target.checked == true || target.checked == "true") ? true : false;
        if(!value){
          let schedules = [initSchedule()];
          dayValue.schedules = schedules;
        }
        dayValue[inputName] = value;
      } else {
        const  scheduleIndex = event.target.dataset.scheduleindex;
        dayValue.schedules[scheduleIndex][inputName] = value;
        dayValue.schedules[scheduleIndex]['from_time_24'] = convertTime12to24(dayValue.schedules[scheduleIndex]['from_time']+" "+dayValue.schedules[scheduleIndex]['from_time_option']);
        dayValue.schedules[scheduleIndex]['to_time_24'] = convertTime12to24(dayValue.schedules[scheduleIndex]['to_time']+" "+dayValue.schedules[scheduleIndex]['to_time_option']);
      }
      this.setState({dayValue:dayValue,userChanged:true});
      this.props.handleChildChange({dayValue : dayValue, index:this.props.index});
    }

    addMultipleSchedule = () => {
      let dayValue = this.state.dayValue;
      let schedules = dayValue.schedules
      schedules.push(initSchedule());
      dayValue.schedules = schedules;
      this.setState({dayValue:dayValue});
      this.props.handleChildChange({dayValue : dayValue, index:this.props.index});
    }

    deleteMultipleSchedule = (event) => {
      let dayValue = this.state.dayValue;
      let schedules = dayValue.schedules
      if(schedules.length == 1) { return false}
      const  scheduleIndex = event.target.dataset.scheduleindex;
      schedules.splice(scheduleIndex, 1);
      dayValue.schedules = schedules;
      this.setState({dayValue:dayValue});
      this.props.handleChildChange({dayValue : dayValue, index:this.props.index});
    }

    maskChange = (newState, oldState, userInput) => {
     var { value } = newState;
     var selection = newState.selection;
     var cursorPosition = selection ? selection.start : null;
     return handleScheduleMasking(value,selection,cursorPosition,userInput);
   }


    render() {
      return(
        <React.Fragment>
          {this.state.dayValue.schedules &&
            this.state.dayValue.schedules.map((obj,idx) =>{
              return (
                <div className="datetimeparent" key={'schedules-'+this.state.dayValue.day+"-"+idx}>
                  {(idx == 0) ?
                    <div className="col-sm-3 col-xs-4 no-padding">
                      <input type="checkbox" className="new-check" checked={(this.state.dayValue.is_checked) ? 'checked' : false} value={(this.state.dayValue.is_checked) ? true : false} name="is_checked"  onChange={this.handleChange}/>
                      <label className="setting-week" htmlFor="Tuesday">{this.state.dayValue.name}</label>
                    </div>
                    :
                    <div className="col-sm-3 col-xs-4 no-padding">
                      &nbsp;
                    </div>
                  }
                  <div className="fromandtoTime col-sm-9 col-xs-8 no-padding">
                    <div className="col-xs-5 newInputFileldOuter equip-field-outer">
                      <div className="newInputLabel" >Open hours</div>
                      <InputMask name="from_time" value={obj.from_time} mask="99:99" className={obj.className.from_time} placeholder="00:00"  onChange={this.handleChange} disabled={(!this.state.dayValue.is_checked) ? true : false} data-dayindex={this.state.dayValue.day} data-scheduleindex={idx} maskChar="" beforeMaskedValueChange={this.maskChange} autoComplete="off" />
                      <select name="from_time_option" value={obj.from_time_option} className={obj.className.from_time_option} onChange={this.handleChange} disabled={(!this.state.dayValue.is_checked) ? true : false} data-dayindex={this.state.dayValue.day} data-scheduleindex={idx} >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    <div className="col-xs-5 newInputFileldOuter equip-field-outer pull-right no-padding-right">
                      <div className="newInputLabel" >Close hours</div>
                      <InputMask name="to_time" value={obj.to_time} mask="99:99" className={obj.className.to_time} placeholder="00:00"  onChange={this.handleChange} disabled={(!this.state.dayValue.is_checked) ? true : false} data-dayindex={this.state.dayValue.day} data-scheduleindex={idx} maskChar="" beforeMaskedValueChange={this.maskChange}  autoComplete="off" />
                      <select name="to_time_option" value={obj.to_time_option} className={obj.className.to_time_option} onChange={this.handleChange} disabled={(!this.state.dayValue.is_checked) ? true : false} data-dayindex={this.state.dayValue.day} data-scheduleindex={idx} >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    {(this.state.dayValue.is_checked) ?
                        (idx === 0) ?
                          <a href="javascript:void(0);" className="add-round-btn" data-dayindex={this.state.dayValue.day} data-scheduleindex={idx}
                          onClick={this.addMultipleSchedule}><span data-dayindex={this.state.dayValue.day} data-scheduleindex={idx}>+</span></a>
                        :
                          <a href="javascript:void(0);" className="add-round-btn" data-dayindex={this.state.dayValue.day} data-scheduleindex={idx} onClick={this.deleteMultipleSchedule}><span data-dayindex={this.state.dayValue.day} data-scheduleindex={idx}>-</span></a>
                      :
                        null
                    }
                  </div>
                </div>
              )
            })
          }
        </React.Fragment>
      )
    }

}

export default WeekScheduleHours;
