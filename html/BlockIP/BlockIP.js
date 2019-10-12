import React, { Component } from 'react';
import Header from '../../Containers/Guest/Header.js';
import Footer from '../../Containers/Guest/Footer.js';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'


class BlockIP extends React.Component {
  render() {
  	localStorage.removeItem('showRecaptcha')
    return (
      <div className="guest">
        <Header />
          <div className="thanku"><h1>Your IP has been blocked temporarily</h1><h3>Please contact support at <a href="mailto:support@aestheticrecord.com">support@aestheticrecord.com</a></h3></div>

        <Footer />
      </div>
    );
  }
}

export default BlockIP;
