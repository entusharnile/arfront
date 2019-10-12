import React, { Component } from 'react';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DefinedRange, DateRangePicker } from 'react-date-range';
import calenLogo from '../../../images/calender.svg';
import { format, addDays } from 'date-fns';
import moment from 'moment';

const dateFormatPicker = 'yyyy-MM-dd';
const dateFormatMoment = 'YYYY-MM-DD';

class DateRange extends Component {
  constructor(props) {
    super(props);
    const dateFormat = localStorage.getItem('dateFormat');

    this.state = {
      dateFormat: dateFormat,
      showCalendar    : false,
      dateRangePicker: {
        selection: {
          startDate: (this.props.startDate) ? moment(this.props.startDate).toDate() : new Date(),
          endDate: (this.props.endDate) ? moment(this.props.endDate).toDate() : new Date(),
          key: 'selection',
        },
      },
      startDate: (this.props.startDate) ? moment(this.props.startDate).toDate() : null,
      endDate: (this.props.endDate) ? moment(this.props.endDate).toDate() : null,
      containerClass:(this.props.containerClass) ? this.props.containerClass : "search-bg new-calender",
      class:(this.props.class) ? this.props.class : "CalendarPreviewArea",
      clicked: 0
      //maxDate: (this.props.maxDate) ? this.props.maxDate : new Date(),
    };
  }

  componentDidMount(){
    document.addEventListener('click', this.handleClick, false);
  }

  static getDerivedStateFromProps(props, state) {
    let returnState = {};
    return returnState;
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
  }

  handleClick = (event) =>  {
    let flag = false;
    if (this.refDateRangePickerContainer.contains(event.target) && this.state.showCalendar === true ) {
      return
    }
    this.toggleCalendar(event.target);
  }

  toggleCalendar = (elem) => {
    if ( elem.name !== 'calendar-input' && this.state.showCalendar === false ) {
      return
    }

    let showCalendar = false

    if (this.state.showCalendar === false && elem.name !== undefined && elem.name === 'calendar-input' ) {
      showCalendar = true
    } else {
      showCalendar = false
    }

    this.setState({showCalendar : showCalendar})
  }

  onChangeDateRange = (payload) => {
    let startDate = payload.selection.startDate
    let endDate   = payload.selection.endDate

    let clicked      = this.state.clicked + 1;

    let localPref = localStorage.getItem('focusedRange');
    let canBypass = (localPref && localPref === 'oneClick') ? true : false;

    if (canBypass) {
      clicked = 2;
    }

    let showCalendar = true;

    if ( clicked % 2 === 0 ) {
      showCalendar = false;
    }

    this.setState({
      showCalendar : showCalendar,
      startDate   : startDate,
      endDate     : endDate,
      clicked     : clicked
    });

    if ( clicked && clicked % 2 === 0 ) {
      this.props.handleChildDateRange({startDate:moment(startDate).format(dateFormatMoment), endDate:moment(endDate).format(dateFormatMoment), canSubmit: true})
    } else {
      this.props.handleChildDateRange({startDate:moment(startDate).format(dateFormatMoment), endDate:moment(endDate).format(dateFormatMoment), canSubmit: false})
    }

  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  };

  render() {
    let selectionRange = {
      startDate: (this.state.startDate) ? this.state.startDate : new Date(),
      endDate: (this.state.endDate) ? this.state.endDate : new Date(),
      key: 'selection',
    }
    return (
      <div className={this.state.containerClass} ref={refDateRangePickerContainer => {this.refDateRangePickerContainer = refDateRangePickerContainer}}>
        <img src={calenLogo} />
         { this.state.showCalendar && <DateRangePicker
            className={this.state.class}
            ranges={[selectionRange]}
            onChange={this.onChangeDateRange}
            maxDate = {this.state.maxDate}
            ref={refDateRangePicker => {this.refDateRangePicker = refDateRangePicker}}
            dragSelectionEnabled={false}
          /> }
          <input
            onChange={this.handleInputChange}
            type="text"
            className="input-cal setting-search-input"
            name="calendar-input"
            autoComplete="off"
            value={(this.state.startDate == null && this.state.endDate == null)
              ? ''  :
            (((this.state.startDate) ? moment(this.state.startDate).format(this.state.dateFormat) : '') + `-` + ((this.state.endDate) ? moment(this.state.endDate).format(this.state.dateFormat) : '' ))}
            ref={refDateRangePickerInput => {this.refDateRangePickerInput = refDateRangePickerInput}}
          />
      </div>
    );
  }
}

export default DateRange;
