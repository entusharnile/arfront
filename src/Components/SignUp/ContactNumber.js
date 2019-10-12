import React, { Component } from 'react';
import IntlTelInput from 'react-intl-tel-input';
export default class contactNumber extends React.Component {

  contactNumberChanged = (inputFiled,t, x, y, number) => {
    this.setState({userChanged: true});
    const contactNumber = number.replace(/\s/g,'')
    let contactNumberError = true;
    let contactNumberClass = 'form-control field_error';
    if(t) {
      contactNumberError = false;
      contactNumberClass = 'form-control';
    }
    this.props.handleChildChange({[inputFiled]:contactNumber,[inputFiled+'Error']:contactNumberError,[inputFiled+'Class']:contactNumberClass})
  }

  render() {
    return (
      <div className="field-group">
        <label htmlFor="usr">{this.props.label}{(this.props.isRequired) ? <span className="required">*</span> : null}</label>
        {(this.props.isRender) && <IntlTelInput
            preferredCountries={['tw']}
            css={ ['intl-tel-input', this.props.class] }
            utilsScript={ 'libcontactNumber.js' }
            defaultValue = {(this.props.value) ? this.props.value : ''}
            defaultCountry = {localStorage.getItem('cCode')}
            fieldName={this.props.name}
            onPhoneNumberChange={ this.contactNumberChanged.bind(this,this.props.name) }
            onPhoneNumberBlur={ this.contactNumberChanged.bind(this,this.props.name) }
            placeholder={this.props.placeholder}
            autoComplete="off"
            separateDialCode={`true`}
          />}
      </div>
    )
  }
}
