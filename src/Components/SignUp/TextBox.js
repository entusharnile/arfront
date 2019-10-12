import React, { Component } from 'react';
export default class TextBox extends React.Component {
  render() {
    return (
      <div className="field-group">
        <label htmlFor="usr">{this.props.label}{(this.props.isRequired) ? <span className="required">*</span> : null}</label>
        <input
        name={this.props.name}
        value={this.props.value}
        onChange={this.props.handleInputChange}
        className={this.props.class}
        placeholder={this.props.placeholder}
        type={this.props.type}
        autoComplete="new-password"
         />
      </div>
    )
  }
}
