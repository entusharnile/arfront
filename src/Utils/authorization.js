import React, { Component } from 'react';
import axios from 'axios';
import config from '../config';
import { isLoggedIn, getUser } from './services';
import { getToken, handleInvalidToken,getRedirectTo, displayName, getIsPosEnabled } from './services.js';
import { Redirect } from 'react-router-dom';
const authInstance = axios.create();
authInstance.defaults.headers.common['access-token'] = getToken();

let redirectTo = getRedirectTo();
let currenctPath = '';

const Authorization = (allowedPrivileges) =>
    (WrappedComponent) => {
        return class WithAuthorization extends React.Component {
            constructor(props) {
              super(props)
              currenctPath = (props.location.pathname) ? props.location.pathname : '';
              redirectTo = getRedirectTo();

                if (!isLoggedIn()) {
                    this.props.history.push('/login');
                }
                authInstance.get(config.API_URL + "check-valid-token" ).then(response => {
                }).catch(error => {
                  let msg = error.response.data.message;
                  if(msg == 'invalid_token' || msg == 'session_timeout' || msg == 'server_error' || msg == 'token_not_found') {
                      handleInvalidToken();
                  }
                })


                let   languageEndpoint      = allowedPrivileges[allowedPrivileges.length - 1];
                const tempLocalStorageData  = JSON.parse(localStorage.getItem('languageData'));
                let userData = JSON.parse(localStorage.getItem('userData'));

                this.state = (localStorage.getItem('globalPrivileges')) ?
                {
                    permissions: JSON.parse(localStorage.getItem('globalPrivileges')).permissions,
                    currentUserRole: localStorage.getItem('currentUserRole'),
                    userData: JSON.parse(localStorage.getItem('userData')),
                    languageData:tempLocalStorageData,
                    languageEndpoint: languageEndpoint
                } : { permissions: {}, roles: {} }

                  if (tempLocalStorageData === null || tempLocalStorageData === undefined || tempLocalStorageData[languageEndpoint] === null || tempLocalStorageData[languageEndpoint] === undefined || tempLocalStorageData[languageEndpoint] === '' )  {
                    authInstance.get(config.API_URL + "getLanguageText/1/" + languageEndpoint).then(response => {
                      tempLocalStorageData[languageEndpoint]  = response.data.data[languageEndpoint];
                      localStorage.setItem('languageData', JSON.stringify(tempLocalStorageData))
                      this.setState({languageData: tempLocalStorageData, languageEndpoint: languageEndpoint});
                    }).catch(error => {
                    })
                  }

              if(userData) {
                window.intercomSettings = {
                  app_id: "jmcvijnb",
                  name:  displayName(userData.user),
                  email: userData.user.email,
                  created_at: userData.user.created, // Signup date as a Unix timestamp,
                  user_id: userData.user.id, // user id at AR platform
                  user_hash: userData.user.intercom_hash
                };

                (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',window.intercomSettings);}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/jmcvijnb';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);}if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})()
              }

              var heap = heap||[];
              heap.load=function(e,t){
                heap.appid=e;
                heap.config=t=t||{};
                var r=t.forceSSL||"https:"===document.location.protocol,
                    a=document.createElement("script");
                    a.type="text/javascript";
                    a.async=!0;
                    a.src=(r?"https:":"http:")+"//cdn.heapanalytics.com/js/heap-"+e+".js";
                    var n=document.getElementsByTagName("script")[0];
                    n.parentNode.insertBefore(a,n);
                    for(var o=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],c=0;c<p.length;c++)heap[p[c]]=o(p[c])};
              heap.load("1552030408");
              if(userData) {
                heap.identify(userData.user.id);
              }

            }

            changeRoute = () => {
              if((redirectTo) && redirectTo != currenctPath){
                return (
                  <div>{this.props.history.push(redirectTo)}</div>
                )
              }
              return null
            }

            componentDidMount() {
              let footer = document.getElementById('protected-footer-fixed');
              if(footer != null && footer != undefined){
                setTimeout(function(){
                  let clHeight = ''
                  if(document.getElementById('protected-footer-fixed')) {
                    let rootHeight = document.getElementById('root').clientHeight;
                    let scrollHeight = document.getElementById('root').scrollHeight;
                    clHeight = document.getElementById('protected-footer-fixed').clientHeight
                    let footerHeight = clHeight;

                    if((rootHeight + footerHeight) > window.innerHeight){
                      footer.classList.remove('footer-fixed')
                    } else {
                      footer.classList.add('footer-fixed')
                    }
                  }
                }, 200);
              }
            }

            componentWillMount() {
              this.unlisten = this.props.history.listen((location, action) => {
                //console.log("on route change");
              });
            }
            componentWillUnmount() {
                this.unlisten();
            }
            componentDidCatch(error, info) {
              // Display fallback UI
              this.setState({ hasError: true });
              // You can also log the error to an error reporting service
              //logErrorToMyService(error, info);
            }

            render() {
                const { permissions, userData, currentUserRole, languageData, languageEndpoint } = this.state;

                const conditionalEndpoint = (allowedPrivileges[4] !== undefined && allowedPrivileges[4] !== null && allowedPrivileges[4] !== '') ? allowedPrivileges[4] : '';
                const conditionalPrivileges = ['manage-subscription','manage-invoices'];

                let currentPrivilege = [];
                if (localStorage.getItem("currentUserRole")) {
                    currentPrivilege = permissions[userData.user.role_name][allowedPrivileges[1]];
                }
                if ('dashboard' === allowedPrivileges[0] || currentPrivilege.find((str) => str === allowedPrivileges[0])) {
                  if (languageData && languageData !== undefined && languageData !== null) {
                      const userPriviliges = userData.permissions;
                      if ('dashboard' === allowedPrivileges[0] || userPriviliges.find((str) => str === allowedPrivileges[0]) ) {
                          if (languageData[languageEndpoint] !== undefined ) {
                            // check dashboard is enabled or not for logged user - START
                            if(conditionalEndpoint === 'dashboard'){
                              let isDashEnabled       = (userData && userData.user) ? userData.user.is_dashboard_enabled : false;
                              if ( userData && getIsPosEnabled() === true && isDashEnabled ===  true ) {
                                return <WrappedComponent {...this.props} />
                              } else {
                                return this.changeRoute()
                              }
                            }
                            // check dashboard is enabled or not for logged user - END
                            // check pos is enabled while accessing sales module for logged user  - START
                            if(languageEndpoint === 'sales'){
                              if (getIsPosEnabled() === true && userPriviliges.indexOf('view-sales') > -1) {
                                return <WrappedComponent {...this.props} />
                              } else {
                                return this.changeRoute()
                              }
                            }
                            // check pos is enabled while accessing sales module for logged user  - END
                            return <WrappedComponent {...this.props} />
                          } else {
                            return <div></div>
                          }
                      } else {
                        return this.changeRoute()
                      }
                  } else {
                    return this.changeRoute()
                  }
                } else if(userData && (allowedPrivileges[0] == userData.user.role_name || allowedPrivileges[0] == userData.user_type || (allowedPrivileges[0] === 'provider' && userData.user.is_provider)) || (conditionalPrivileges.indexOf(conditionalEndpoint) > -1)) {
                  if (languageData[languageEndpoint] !== undefined ) {
                    // check manage-subscription and manage-invoices is enabled or not for logged user - START
                    if(conditionalPrivileges.indexOf(conditionalEndpoint) > -1){
                        const userPriviliges = userData.permissions;
                        if (userData.user.account_id != config.JUVLY_ACC_ID && userData.user.account_id != config.CC_ACC_ID && (userPriviliges.indexOf('manage-subscription-details') > -1 || userData.user_type === 'superadmin')) {
                        if (conditionalEndpoint == 'manage-subscription' || (conditionalEndpoint == 'manage-invoices' && userData.account.account_subscription.account_code.indexOf('cus_') > -1)) {
                          return <WrappedComponent {...this.props} />
                        } else {
                          return this.changeRoute()
                        }
                      } else {
                        return this.changeRoute()
                      }
                    }
                    // check manage-subscription and manage-invoices is enabled or not for logged user - END
                    return <WrappedComponent {...this.props} />
                  } else {
                    return <div></div>
                  }
                } else if(allowedPrivileges[0] == 'access-all') {
                  return <WrappedComponent {...this.props} />
                } else {
                  return this.changeRoute()
                }
            }
        }
    }

export default Authorization;
