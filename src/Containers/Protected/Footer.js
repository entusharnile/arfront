import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import config from '../../config';
import axios from 'axios';
import { Link } from 'react-router-dom';

class Footer extends React.Component {
  constructor(props) {
      super(props);
      document.body.classList.remove('guest-body')
      const userData = JSON.parse(localStorage.getItem('userData'));
      const languageData = JSON.parse(localStorage.getItem('languageData'));
      this.state = {
          email: '',
          password: '',
          globalLang: (languageData !== null && languageData.global !== null && languageData.global !== undefined) ? languageData.global : {},
          isDesktop: false,
          userData  : userData
      };
      this.updatePredicate = this.updatePredicate.bind(this);
  }

  componentDidMount() {
    this.updatePredicate();
    window.addEventListener("onload", this.updatePredicate);
  }

  componentWillUnmount() {
    window.removeEventListener("onunload", this.updatePredicate);
  }

  updatePredicate() {
    this.setState({ isDesktop:window.innerWidth > document.documentElement.clientWidth });
  }

  render() {
    return (
      <footer className= {this.state.isDesktop? "main-footer" : "main-footer"} id='protected-footer-fixed'>
      	<div className="container-fluid">
      		<span className="pull-right">
            <label>{(this.state.globalLang !== undefined && this.state.globalLang !== null) ? this.state.globalLang.global_footer : ''}</label>
      		</span>
      	</div>
      </footer>
    )
  }
}

export default Footer;
