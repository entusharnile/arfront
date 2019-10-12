import React, { Component } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

export default class Error404 extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState;
  }

  get initialState() {
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    return {
      globalLang: languageData.global,
    };
  }
  render() {
    return (
      <div id="content">
        <div className="wide-popup">
          <div className="wide-popup-wrapper time-line">
            <center>
                Privilege Not Found!
            </center>
          </div>
        </div>
      </div>
    );
  }
}
