import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Header extends React.Component {
    render() {
        return (
            <div className="header">
              <div className="wrapper">
                <Link to="/" className="logo"><img src="/images/logo.png?v=123" /></Link>
                  <div className="header-right">
                    <ul className="nav">
                      <li><a href="https://www.aestheticrecord.com/">Home</a></li>
                      <li><Link to="/login" className="login">Login</Link></li>
                      <li><a href="https://www.aestheticrecord.com/aesthetic-record-emr-plans-and-pricing" className="login">Get Started</a></li>
                    </ul>
                  </div>
              </div>
          </div>
        );
    }
}

export default Header;
