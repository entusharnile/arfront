import React, { Component } from 'react';
import IntlTelInput from 'react-intl-tel-input';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {showFormattedDate, getDateFormat, dateFormatPicker } from '../../Utils/services.js';
import moment from 'moment';


const valueToNull = (value) => {
  if((typeof value != undefined && value != null && value != "0000-00-00")){
    return new Date(value);
  } else {
    return null;
  }
}

export default class CustomDatePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userChanged:false,
      maxDate: (this.props.maxDate) ? this.props.maxDate : new Date(moment().add(20, "years").toDate()),
      minDate: (this.props.minDate) ? this.props.minDate : new Date(moment().subtract(20, "years").toDate()),
      value:(this.props.value) ? valueToNull(this.props.value) :'',
      format: (this.props.format) ? this.props.format : dateFormatPicker(), //dateFormatPicker()
      name:(this.props.name) ? this.props.name : 'date_picker',
      class: (this.props.class) ? this.props.class : 'setting-input-box',
      showMonthYearPicker: (this.props.showMonthYearPicker) ? true : false,
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if(nextProps.value !== undefined && nextProps.value !== prevState.value){
      returnState.value = valueToNull(nextProps.value)
    }
    if(nextProps.class !== undefined && nextProps.class !== prevState.class){
      returnState.class = nextProps.class
    }
    return returnState;
  }



  onChangeDatePicker = (date) => {
    this.setState({ userChanged: true, value: date })
    this.props.onChangeDatePicker({userChanged: true, [this.state.name]: date })
  }

  render() {
    return (
      <DatePicker
        className={this.state.class}
        selected = {(this.state.value) ? this.state.value: null}
        dateFormat={this.state.format}
        onChange={this.onChangeDatePicker}
        maxDate={this.state.maxDate}
        minDate={this.state.minDate}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        autoComplete='off'
        name={this.state.name}
        readOnly={this.props.readOnly}
        autoComplete="off"
        placeholderText={this.state.format.toLowerCase()}
        showMonthYearPicker={this.state.showMonthYearPicker}
      />
    )
  }
}
