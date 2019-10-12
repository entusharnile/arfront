import React, { Component } from 'react';
import IntlTelInput from 'react-intl-tel-input';
export default class PhoneNumber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userChanged:false,
      country: (this.props.country) ? this.props.country : localStorage.getItem('cCode'),
      phoneNumberClass: (this.props.class) ? this.props.class :'setting-input-box',
      phoneNumberError:false,
      value:(this.props.value) ? this.props.value :'',
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if(nextProps.class !== undefined && nextProps.class !== prevState.phoneNumberClass){
      returnState.phoneNumberClass = nextProps.class
    }
    if(nextProps.value !== undefined && nextProps.value !== prevState.value){
      returnState.value = nextProps.value
    }
    return returnState;
  }



  onPhoneNumberChange = (inputFiled,t, x, y, number) => {
    let phoneNumber = number
    let phoneNumberError = true;
    let phoneNumberClass = 'setting-input-box setting-input-box-invalid';
    if(t) {
      phoneNumber = number.replace(/[ `~!@#$%^&*()_|\-=?;:'",.<>\{\}\[\]\\\/]/gi,'')
      phoneNumberError = false;
      phoneNumberClass = 'setting-input-box';
    }
    const returnState = {
      [inputFiled]:phoneNumber,
      [inputFiled+'Error']:phoneNumberError,
      [inputFiled+'Class']:phoneNumberClass,
      userChanged:true
    }
    this.setState({
      phoneNumberClass: phoneNumberClass,
      phoneNumberError:phoneNumberError,
      value:phoneNumber,
      userChanged:true
    })
    this.props.onPhoneNumberChange({
      [inputFiled]:phoneNumber,
      [inputFiled+'Error']:phoneNumberError,
      [inputFiled+'Class']:phoneNumberClass,
      userChanged:true
    })
  }

  render() {
    return (
      (this.props.isRender) ?
        <IntlTelInput
          preferredCountries={['tw']}
          css={ ['intl-tel-input', this.state.phoneNumberClass] }
          utilsScript={ 'libphonenumber.js' }
          defaultValue = {this.state.value}
          defaultCountry = {this.state.country}
          fieldName={this.props.name}
          onPhoneNumberChange={this.onPhoneNumberChange.bind(this,this.props.name)}
          onPhoneNumberBlur={this.onPhoneNumberChange.bind(this,this.props.name)}
          placeholder={this.props.placeholder}
          autoComplete="new-password"
          separateDialCode={`true`}
        />
        :
        null
    )
  }
}
