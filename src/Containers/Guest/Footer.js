import React, { Component } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons/faCoffee';
import { faFacebook } from '@fortawesome/free-brands-svg-icons/faFacebook';
import { faTwitter } from '@fortawesome/free-brands-svg-icons/faTwitter';
import { faYoutube } from '@fortawesome/free-brands-svg-icons/faYoutube';
import { faGooglePlus } from '@fortawesome/free-brands-svg-icons/faGooglePlus';
import { faInstagram } from '@fortawesome/free-brands-svg-icons/faInstagram';
import { faMapMarker } from '@fortawesome/free-solid-svg-icons/faMapMarker';
import { ToastContainer, toast } from "react-toastify";

class Footer extends React.Component {
  constructor(props) {
    super(props);
    document.body.classList.add('guest-body')
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.state = {
        globalLang: (languageData !== null && languageData.global !== null && languageData.global !== undefined) ? languageData.global : {},
      };
    }

  componentDidMount(){
    let rootHeight = document.getElementById('root').clientHeight;
    // let footer = document.getElementById('guest-footer-fixed');
    // if(footer != null && footer != undefined){
    //   let footerHeight = document.getElementById('guest-footer-fixed').clientHeight;
    //   if((rootHeight + footerHeight) > window.innerHeight){
    //     let footer = document.getElementById('guest-footer-fixed');
    //     footer.classList.remove('footer-fixed')
    //   }
    // }
   }

  render() {
    return (
      <footer className="footer-fixed" id='guest-footer-fixed'>
        <div className="wrapper">
          <p>{this.state.globalLang.global_footer} <a href="https://www.aestheticrecord.com/aesthetic-record-emr-terms-of-service/" target="_blank">{this.state.globalLang.global_terms_of_service}</a>&nbsp;&nbsp; <a className="ar-policy-link" href="https://www.aestheticrecord.com/aesthetic-record-emr-policies/" target="_blank">{this.state.globalLang.global_ar_policies}</a></p>
        
          <ul id="social">
            <li><a target="_blank" href="https://twitter.com/Aesthetic_Rec"><FontAwesomeIcon icon={faTwitter} /> </a></li>
            <li><a target="_blank" href="https://www.facebook.com/aesthetic.rec/"><FontAwesomeIcon icon={faFacebook}/></a></li>
            <li><a target="_blank" href="https://www.youtube.com/channel/UCY2W0j0DbqLsg4qomXL0c1g"><FontAwesomeIcon icon={faYoutube} /> </a></li>
            <li><a target="_blank" href="https://plus.google.com/b/110237484009069856390/110237484009069856390"><FontAwesomeIcon icon={faGooglePlus} /></a></li>
            <li><a target="_blank" href="https://www.instagram.com/aestheticrecord/"><FontAwesomeIcon icon={faInstagram} /> </a></li>
          </ul>
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
      </footer>
    )
  }
}

export default Footer;
