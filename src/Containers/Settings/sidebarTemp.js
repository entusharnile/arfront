import React, { Component } from 'react';
import { BrowserRouter, Link } from 'react-router-dom'
import config from '../../config';
import axios from 'axios';
import { withRouter } from 'react-router';


const checkPermission = (globalPermission, specificPermission) => {
    return globalPermission.find((str) => str === specificPermission);
}

class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        const sideBarText = JSON.parse(localStorage.getItem('languageData'));
        const userPermissions = JSON.parse(localStorage.getItem('userData')).permissions;
        let sideBarPermissions = [...userPermissions];

        let userData = JSON.parse(localStorage.getItem('userData'));
        let languageData = JSON.parse(localStorage.getItem('languageData'));
        let sideBarContent = [];
        // Account Information permissions check
        let innerAcntInfo = [{
            label: languageData.settings['sidebar_profile_menu'],
            to: '/settings/profile',
            match: ['/settings/profile']
        },
        {
            label: languageData.settings['sidebar_2FA_menu'],
            to: '/settings/two-factor-auth',
            match: ['/settings/two-factor-auth']
        }
        ];
        if (checkPermission(sideBarPermissions, 'manage-account-information')) {
            innerAcntInfo.push({
                label: languageData.settings['sidebar_AR_menu'],
                to: '/settings/ar-account',
                match: ['/settings/ar-account']
            });
            const acntInfo = {
                icon: 'fas angle-down',
                label: 'Account Information',
                content: innerAcntInfo
            }


            if (userData.account.pos_gateway === 'stripe' && userData.account.account_type === 'paid' && userData.account.stripe_mode === 'express') {
                if ((userData.user_type === 'superadmin') || ((userData.user.account_id === config.JUVLY_ACC_ID || userData.user.account_id === config.CC_ACC_ID) && userData.user.user_role_id === 1)) {
                    innerAcntInfo.push(
                    {
                        label: languageData.settings['sidebar_POS_menu'],
                        to: '/settings/pos',
                        match: ['/settings/pos']
                    },
                    {
                        label: languageData.settings['sidebar_POS_disputes_menu'],
                        to: '/settings/pos-disputes',
                        match: ['/settings/pos-disputes']
                    });
                }
            }

            sideBarContent.push(acntInfo);
        }

        // Manage Clinics permissions check
        if (checkPermission(sideBarPermissions, 'manage-clinics') || checkPermission(sideBarPermissions, 'manage-questionnaires') || checkPermission(sideBarPermissions, 'manage-consents') || checkPermission(sideBarPermissions, 'manage-pre-treatment-instructions') || checkPermission(sideBarPermissions, 'manage-post-treatment-instructions')) {
            let innerClinicInfo = [];
            if (checkPermission(sideBarPermissions, 'manage-clinics')) {
                innerClinicInfo.push({
                    label: languageData.settings['sidebar_menu-clinics'],
                    to: '/settings/clinics',
                    match: ['/settings/clinics', '/settings/clinic/:id/edit', '/settings/clinic/create']
                })
            }
            if (checkPermission(sideBarPermissions, 'manage-questionnaires')) {
                innerClinicInfo.push({
                    label: languageData.settings['sidebar_questionnaires_menu'],
                    to: '/settings/questionnaires',
                    match: ['/settings/questionnaires', '/settings/questionnaires/:id/edit', '/settings/questionnaires/create']
                })
            }
            if (checkPermission(sideBarPermissions, 'manage-consents')) {
                innerClinicInfo.push({
                    label: languageData.settings['sidebar_consents_menu'],
                    to: '/settings/consents',
                    match: ['/settings/consents', '/settings/consent/:id/edit', '/settings/consent/create']
                })
            }
            if (checkPermission(sideBarPermissions, 'manage-pre-treatment-instructions')) {
                innerClinicInfo.push({
                    label: languageData.settings['sidebar_pre_treatment_instructions_menu'],
                    to: '/settings/pre-treatment-instructions',
                    match: ['/settings/pre-treatment-instructions', '/settings/pre-treatment-instructions/:id/edit', '/settings/pre-treatment-instructions/create']
                }, {
                        label: languageData.settings['sidebar_pre_treatment_email_menu'],
                        to: '/settings/pre-treatment-email',
                        match: ['/settings/pre-treatment-email']
                    })
            }
            if (checkPermission(sideBarPermissions, 'manage-post-treatment-instructions')) {
                innerClinicInfo.push({
                    label: languageData.settings['sidebar_post_treatment_instructions_menu'],
                    to: '/settings/post-treatment-instructions',
                    match: ['/settings/post-treatment-instructions', '/settings/post-treatment-instructions/:id/edit', '/settings/post-treatment-instructions/create']
                }, {
                        label: languageData.settings['sidebar_post_treatment_email_menu'],
                        to: '/settings/post-treatment-email',
                        match: ['/settings/post-treatment-email']
                    })
            }
            innerClinicInfo.push({
                label: languageData.settings['sidebar_procedure_menu'],
                to: '/settings/procedure-templates',
                match: ['/settings/procedure-templates']
            })
            const manageClinics = {
                icon: 'icon-angle-down',
                label: languageData.settings['sidebar_manageClinics_menu'],
                content: innerClinicInfo
            };
            sideBarContent.push(manageClinics)
        }

        if (checkPermission(sideBarPermissions, 'manage-appointment-settings')) {
            let apptInfo = [];
            apptInfo.push(
                {
                    label: languageData.settings['sidebar_appointments_email_sms_menu'],
                    to: '/settings/appointment-email-sms',
                    match: ['/settings/appointment-email-sms']
                },
                {
                    label: languageData.settings['sidebar_survey_settings_menu'],
                    to: '/settings/survey-email-sms',
                    match: ['/settings/survey-email-sms']
                },
                {
                    label: languageData.settings['sidebar_url_menu'],
                    to: '/settings/configure-uri',
                    match: ['/settings/configure-uri']
                },
            )
            if (userData.account.pos_enabled > 0) {
                apptInfo.push({
                    label: languageData.settings['sidebar_cancellation_menu'],
                    to: '/settings/cancellation-policy',
                    match: ['/settings/cancellation-policy']
                })
            }
            apptInfo.push(
                {
                    label: languageData.settings['sidebar_patient_menu'],
                    to: '/settings/patient-portal',
                    match: ['/settings/patient-portal']
                },
                {
                    label: languageData.settings['sidebar_appointmentReminder_menu'],
                    to: '/settings/appointment-reminder',
                    match: ['/settings/appointment-reminder', '/settings/appointment-reminder/create', '/settings/appointment-reminder/:reminderId/edit']
                }
            )
            sideBarContent.push({
                icon: 'icon-angle-down',
                label: languageData.settings['sidebar_Appointments_menu'],
                content: apptInfo
            })
        }

        sideBarContent.push({
            label: languageData.settings['sidebar_membership_wallet_menu'],
            to: '/settings/membership-wallet',
            match: ['/settings/membership-wallet']
        })

        if (checkPermission(sideBarPermissions, 'manage-users') || checkPermission(sideBarPermissions, 'manage-user-roles')) {
            let innerUserInfo = [];

            if (checkPermission(sideBarPermissions, 'manage-users')) {
                innerUserInfo.push({
                    label: languageData.settings['sidebar_users_menu'],
                    to: '/settings/users',
                    match: ['/settings/users', '/settings/users/create', '/settings/users/:userId/edit']
                })
            }

            if (checkPermission(sideBarPermissions, 'manage-user-roles')) {
                innerUserInfo.push({
                    label: languageData.settings['sidebar_userRole_menu'],
                    to: '/settings/user-roles',
                    match: ['/settings/user-roles']
                })
            }
            sideBarContent.push({
                icon: 'icon-angle-down',
                label: languageData.settings['sidebar_teammates_menu'],
                content: innerUserInfo
            })
        }

        if (userData.user.account_id != config.JUVLY_ACC_ID && userData.user.account_id != config.CC_ACC_ID) {
            if (checkPermission(sideBarPermissions, 'manage-subscription-details') || userData.user_type === 'superadmin') {
                let innerBillingInfo = [{
                    label: languageData.settings['sidebar-manage-subscription-details'],
                    to: '/settings/manage-subscription',
                    match: ['/settings/manage-subscription']
                }];
                if (userData.account.account_subscription.account_code.indexOf('cus_') > -1) {
                    innerBillingInfo.push({
                        label: languageData.settings['sidebar-view-sales-invoices'],
                        to: '/settings/manage-invoices',
                        match: ['/settings/manage-invoices']
                    })
                }
                sideBarContent.push({
                    icon: 'icon-angle-down',
                    label: languageData.settings['sidebar_your_billing_menu'],
                    content: innerBillingInfo
                })
            }
        }

          if (userData.account.pos_gateway === 'stripe' && userData.account.account_type === 'paid' && userData.account.stripe_mode === 'custom' && userData.user_type === 'superadmin') {
              let posInfo = []
              if(userData.pos_enabled == 1){
                posInfo.push(
                  {
                    label: languageData.settings['sidebar_POS_dashboard_menu'],
                    to: '/settings/pos-dashboard',
                    match: ['/settings/pos-dashboard']
                },
                {
                    label: languageData.settings['sidebar_POS_payments_menu'],
                    to: '/settings/pos-payments',
                    match: ['/settings/pos-payments']
                },
                {
                    label: languageData.settings['sidebar_POS_payouts_menu'],
                    to: '/settings/pos-payouts',
                    match: ['/settings/pos-payouts']
                }
              );
              }
              posInfo.push(
                {
                  label: languageData.settings['sidebar_POS_settings_menu'],
                  to: '/settings/pos-settings',
                  match: ['/settings/pos-settings']
              }
            );
              if(userData.pos_enabled == 1){
                posInfo.push(
                {
                    label: languageData.settings['sidebar_POS_payment_settings_menu'],
                    to: '/settings/pos-payment-settings',
                    match: ['/settings/pos-payment-settings']
                },
                {
                    label: languageData.settings['sidebar_POS_disputes_menu'],
                    to: '/settings/pos-disputes',
                    match: ['/settings/pos-disputes']
                }
              );
              }

              sideBarContent.push({
                  icon: 'icon-angle-down',
                  label: languageData.settings['sidebar_POS_menu'],
                  content: posInfo
              });

          }


        sideBarContent.push({
            label: languageData.settings['sidebar_recently_deleted_menu'],
            to: '/settings/recently-deleted',
            match: ['/settings/recently-deleted']
        })

        this.state = {
            toggleClassName: 'new-setting-tabs-a',
            sideBarContent: sideBarContent
        }
    }

    componentDidMount() {

    }

    toggleNav = (e) => {
        let targetClass = e.target.getAttribute('class')
        let parentNode = e.target.parentNode
        let targetNode = e.target
        let grandParentNode = e.target.parentNode.parentNode

        if (targetClass === null) {
            targetNode = grandParentNode
        }

        if (targetClass !== null && targetClass.indexOf('svg-inline') > -1) {
            targetNode = parentNode
        }

        if (!targetNode.classList.contains('active-menu')) {
            targetNode.classList.add('active-menu');
            targetNode.nextElementSibling.classList.remove('no-display');
            targetNode.querySelector('svg').classList.remove('fa-angle-right');
            targetNode.querySelector('svg').classList.add('fa-angle-down');
        } else {
            targetNode.classList.remove('active-menu');
            targetNode.nextElementSibling.classList.add('no-display');
            targetNode.querySelector('svg').classList.remove('fa-angle-down');
            targetNode.querySelector('svg').classList.add('fa-angle-right');
        }
    }

    activeParentLink = (obj) => {
        let returnClass = "new-setting-subtabs-a"
        if (obj !== undefined) {
            obj.map((io, ix) => {
                if (io.content !== undefined) {
                    io.content.map((o, i) => {
                        if (o.match.indexOf(this.props.match.path) > -1) {
                            returnClass = "new-setting-subtabs-a active-menu"
                        }
                    })
                }
            })
        }
        return { returnClass }
    }

    noChildClass = (obj) => {
      let returnClass = "new-setting-tabs-li"

      if (obj !== undefined) {
          obj.map((io, ix) => {
            if ( io.match && io.match !== undefined) {
              if (io.match.indexOf(this.props.match.path) > -1) {
                returnClass = "new-setting-tabs-li active-menu"
              }
            }
          })
      }

      return { returnClass }
    }

    render() {
        let nav = [];
        nav = this.state.sideBarContent.map((obj, idx) => {
            let toggleClasss    = this.activeParentLink([obj]).returnClass
            let subMenuULClass  = (toggleClasss.indexOf('active-menu') > -1) ? "setting-submenu" : "setting-submenu no-display";
            let iClass          = (toggleClasss.indexOf('active-menu') > -1) ? "fas fa-angle-down" : "fas fa-angle-right";
            let parentLiClass   = this.noChildClass([obj]).returnClass
            /*this.state.toggleClassName     = toggleClasss;*/

            return (<li className={parentLiClass} key={idx} ref={'parents'} >
                {(obj.to !== undefined) ? <Link className={toggleClasss} to={(obj.to !== undefined) ? obj.to : "javascript:void(0)"}> {obj.label} </Link> : <a className={toggleClasss} onClick={obj.content !== undefined ? this.toggleNav.bind(this) : undefined} href={(obj.to !== undefined) ? obj.to : "javascript:void(0)"}> {obj.label}
                    {obj.content !== undefined &&
                        <i className={iClass}></i>
                    }
                </a>}


                {obj.content !== undefined && obj.content.length > 0 &&
                    <ul className={subMenuULClass}>
                        {obj.content.map((innerObj, innerIdx) => {
                            let subMenuClass = (innerObj.match.indexOf(this.props.match.path) > -1) ? "new-setting-subtabs-a sel-submenu" : "new-setting-subtabs-a"
                            return (<li className="new-setting-subtabs-li" key={innerIdx}>
                                <Link className={subMenuClass} to={innerObj.to} > {innerObj.label} </Link>
                            </li>)
                        })}
                    </ul>
                }
            </li>)
        })

        return (
            <div className="setting-left-menu">
                <div className="setting-title">Settings</div>
                <ul className="new-setting-tabs">
                    {nav}
                </ul>
            </div>
        );
    }
}

export default (withRouter(Sidebar));
