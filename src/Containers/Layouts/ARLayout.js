import React, { Component } from 'react';
import Header from '../Protected/Header';
import Footer from '../Protected/Footer';
import { getToken, handleInvalidToken } from '../../Utils/services.js';
import { ToastContainer, toast } from "react-toastify";
import config from '../../config.js';
import axios from 'axios';
const url = config.API_URL;

const layoutInstance = axios.create();
layoutInstance.defaults.headers.common['access-token'] = getToken();

class ARLayout extends Component {
    constructor(props) {
        super(props);
        layoutInstance.get(config.API_URL + "check-valid-token" ).then(response => {
        }).catch(error => {
          if (error.response !== undefined) {
            let msg = error.response.data.message;

            if (msg == 'invalid_token' || msg == 'session_timeout' || msg == 'server_error' || msg == 'token_not_found') {
                handleInvalidToken();
            }
          } else {
            handleInvalidToken();
          }
        })
    }

    render() {
      return (
            <div className="main protected">
                <Header/>
                {this.props.children}
                <Footer />
                <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
            </div>
        );
    }
}
export default ARLayout;
