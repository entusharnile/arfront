import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import { findDOMNode } from 'react-dom'
import config from '../../../../config';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import Privilege from './Privilege.js';
import { fetchRolePermissions, saveRolePrivileges,exportEmptyData } from '../../../../Actions/Settings/settingsActions.js';
import axios from 'axios';
import { isFormSubmit } from '../../../../Utils/services.js';
import Footer from '../../../../Containers/Protected/Footer.js';

class UserRoles extends Component {

	constructor(props) {
		super(props);

		const globalPrivileges = JSON.parse(localStorage.getItem('globalPrivileges')).permissions;
		const languageData = JSON.parse(localStorage.getItem('languageData'))
		this.state = {
			roles: ['admin', 'provider', 'frontdesk', 'md'],
			privilegeList: {},
			showLoader: false,
			settingsLangData: languageData.settings,
			activeAdminRole: true,
			selectedPrivilege: [],
			selectedRoleId: 1,
			permissions: []
		}
		localStorage.setItem('loadFresh', false);
		localStorage.setItem('sortOnly', false);
		window.onscroll = () => {
			const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop))
			if (
				window.innerHeight + scrollTop ===
				document.documentElement.offsetHeight &&
				this.state.next_page_url != null) {
				this.loadMore();
			}
		};
	}

	componentDidMount() {
		let formData = {
			'params': {
				page: this.state.page,
				pagesize: this.state.pagesize,
				sortby: this.state.sortby,
				sortorder: 'asc',
				term: this.state.term
			}
		}

		const languageData = JSON.parse(localStorage.getItem('languageData'))
		this.setState({
			settings_edit_privileges: languageData.settings['settings_edit_privileges'],
			sidebar_userRole_menu: languageData.settings['sidebar_userRole_menu'],
			user_Role: languageData.settings['user_Role'],
			privilege_provider: languageData.settings['privilege_provider'],
			privilege_admin: languageData.settings['privilege_admin'],
			privilege_md: languageData.settings['privilege_md'],
			privilege_front_desk_user: languageData.settings['privilege_front_desk_user'],
			loading_please_wait_text: languageData.global['loading_please_wait_text'],
			user_save_btn_text: languageData.settings['user_save_btn_text'],
		})
		this.setState({ 'showLoader': true })
		this.props.fetchRolePermissions(1);
	}

	handleFieldChange = (fieldId, value) => {
		let selPrivilege = [];
		if (value != undefined) {
			selPrivilege = this.state.selectedPrivilege;
			selPrivilege[fieldId] = value;
			this.setState({ selPrivilege: selPrivilege });
		} else {
			let selPrivilege = this.state.selectedPrivilege;
			if (fieldId != undefined) {
				for (let x in fieldId) {
					selPrivilege[x] = fieldId[x];
				}
				this.setState({ selectedPrivilege: selPrivilege });
			}
		}
	}


	getRolePermissions = (e) => {
		localStorage.setItem('showLoader', true);
		let arr = ['activeAdminRole', 'activeProviderRole', 'activeFDRole', 'activeMDRole'];
		let selectedRole = arr[e.currentTarget.dataset.role - 1];
		this.setState({ activeAdminRole: false, activeProviderRole: false, activeFDRole: false, activeMDRole: false })
		this.setState({ [selectedRole]: true, selectedRoleId: e.currentTarget.dataset.role });
		this.setState({ 'showLoader': true })
		this.props.fetchRolePermissions(e.currentTarget.dataset.role);
	}

	savePrivileges = () => {
		if(isFormSubmit()){
			localStorage.setItem('showLoader', true);
			let permissions = [];
			for (let x in this.state.selectedPrivilege) {
				var idArr = x.split('-');
				var id = idArr[idArr.length - 1];
				permissions.push({ id: id, value: (this.state.selectedPrivilege[x] == 'true' || this.state.selectedPrivilege[x] == 1) ? 1 : 0 })
			}

			let formData = { role_id: this.state.selectedRoleId, permissions: permissions };

			this.setState({ 'showLoader': true })
			this.props.saveRolePrivileges(formData)
		}
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
			nextProps.exportEmptyData()
	        return {showLoader : false};
	     }
		if (nextProps.privilegeList != undefined && nextProps.privilegeList.permissions !== prevState.privilegeList) {
			let x = nextProps.privilegeList.permissions;
			if(x.appointments) {
				let notDesiredSysname = ['update-cancel-reschedule-appointment', 'manage-services', 'manage-Services-Packages', 'manage-provider-schedule', 'manage-equipments-schedule', 'manage-resource-schedule', 'view-provider-schedule'];
				let appointmentsPrivilege = []
				x['appointments'].map((obj, idx) => {
					if(notDesiredSysname.indexOf(obj.sysname) > -1){

					} else {
						appointmentsPrivilege.push(obj)
					}
				})
				nextProps.privilegeList.permissions.appointments = appointmentsPrivilege;
				nextProps.exportEmptyData()
				return { privilegeList: nextProps.privilegeList.permissions, showLoader: false, selectedPrivilege: [] }
			}
		}

		if(nextProps.updatedTimeStamp != undefined && nextProps.updatedTimeStamp != prevState.updatedTimeStamp) {
			nextProps.exportEmptyData()
			return {showLoader: false, updatedTimeStamp: nextProps.updatedTimeStamp}
		}
		return {}
	}

	render() {
		return (
			<div id="content">
				<div className="container-fluid content setting-wrapper">
					<Sidebar />
					<div className="setting-setion">
						<div className="setting-container">
							<div className="setting-title">{this.state.settings_edit_privileges}</div>
							<div className="row">
								<div className="col-lg-3">
									<div className="settings-subtitle m-b-20">{this.state.sidebar_userRole_menu}</div>
									<ul className="privileges-submenu">
										<li className="privileges-subtabs-li">
											<a className={this.state.activeAdminRole ? "privileges-subtabs-a sel-submenu edit_role" : "privileges-subtabs-a edit_role"} data-role='1' onClick={this.getRolePermissions.bind(this)}>{this.state.privilege_admin}</a>
										</li>
										<li className="privileges-subtabs-li"><a className={this.state.activeProviderRole ? "privileges-subtabs-a sel-submenu edit_role" : "privileges-subtabs-a edit_role"} data-role='2' onClick={this.getRolePermissions.bind(this)} >{this.state.privilege_provider}</a>
										</li>
										<li className="privileges-subtabs-li"><a className={this.state.activeFDRole ? "privileges-subtabs-a sel-submenu edit_role" : "privileges-subtabs-a edit_role"} data-role='3' onClick={this.getRolePermissions.bind(this)}>{this.state.privilege_front_desk_user}</a>
										</li>
										<li className="privileges-subtabs-li" ><a className={this.state.activeMDRole ? "privileges-subtabs-a sel-submenu edit_role" : "privileges-subtabs-a edit_role"} data-role='4' onClick={this.getRolePermissions.bind(this)}>{this.state.privilege_md}</a>
										</li>
									</ul>
								</div>
								<div className="col-lg-9 col-md-12" id="ajax_view">
									<div className="row">
										<div className="col-lg-4 col-md-6">
											<div className="previlage-ouer-section">
												<div className="settings-subtitle m-b-20">{this.state.privilegeList['patients-management'] && this.state.settingsLangData['patients-management']}</div>
												{this.state.privilegeList['patients-management']
													&&
													<Privilege module={'patients-management'} roleId={this.state.selectedRoleId} list={this.state.privilegeList['patients-management']} langData={this.state.settingsLangData} onChange={this.handleFieldChange} />
												}

											</div>
										</div>
										<div className="col-lg-4 col-md-6">
											<div className="previlage-ouer-section">
												<div className="settings-subtitle m-b-20">{this.state.privilegeList['appointments'] && this.state.settingsLangData['appointments']}</div>
												{this.state.privilegeList['appointments']
													&&
													<Privilege module={'appointments'} roleId={this.state.selectedRoleId} list={this.state.privilegeList['appointments']} langData={this.state.settingsLangData} onChange={this.handleFieldChange} />
												}
											</div>
											<div className="previlage-ouer-section">
												<div className="settings-subtitle m-b-20">{this.state.privilegeList['settings'] && this.state.settingsLangData['settings']}</div>
												{this.state.privilegeList['settings']
													&&
													<Privilege module={'settings'} roleId={this.state.selectedRoleId} list={this.state.privilegeList['settings']} langData={this.state.settingsLangData} onChange={this.handleFieldChange} />
												}
											</div>
										</div>
										<div className="col-lg-4 col-md-6">
											<div className="previlage-ouer-section">
												<div className="settings-subtitle m-b-20">{this.state.privilegeList['sales'] && this.state.settingsLangData['sales']}</div>
												{this.state.privilegeList['sales']
													&&
													<Privilege module={'sales'} roleId={this.state.selectedRoleId} list={this.state.privilegeList['sales']} langData={this.state.settingsLangData} onChange={this.handleFieldChange} />
												}
											</div>
											<div className="previlage-ouer-section">
												<div className="settings-subtitle m-b-20">{this.state.privilegeList['inventory-management'] && this.state.settingsLangData['inventory-management']}</div>
												{this.state.privilegeList['inventory-management']
													&&
													<Privilege module={'inventory-management'} roleId={this.state.selectedRoleId} list={this.state.privilegeList['inventory-management']} langData={this.state.settingsLangData} onChange={this.handleFieldChange} />
												}

											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="footer-static">
							<a id="save_role" className="new-blue-btn pull-right" onClick={this.savePrivileges}>{this.state.user_save_btn_text}</a>
						</div>
						<div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
							<div className="loader-outer">
								<img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
								<div id="modal-confirm-text" className="popup-subtitle" >{this.state.loading_please_wait_text}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

}

function mapStateToProps(state) {
	const languageData = JSON.parse(localStorage.getItem('languageData'));
	const returnState = {};
	if (state.SettingReducer.action === "PRIVILEGE_LIST") {
		if (state.SettingReducer.data.status != 200) {
			toast.dismiss()
			toast.error(languageData.global[state.SettingReducer.data.message]);
			returnState.showLoader = false
		}
		else {
				returnState.privilegeList= state.SettingReducer.data.data
		}
	}
	else if (state.SettingReducer.action === "PRIVILEGE_UPDATE") {
		localStorage.setItem('showLoader', false);
		if (state.SettingReducer.data.status != 200){
			toast.dismiss()
			toast.error(languageData.global[state.SettingReducer.data.message]);
			returnState.showLoader = false
		}
		else {
			toast.dismiss()
		 toast.success(languageData.global[state.SettingReducer.data.message]);
		 returnState.updatedTimeStamp = new Date();
	 }
	}
	return returnState;
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ fetchRolePermissions: fetchRolePermissions, saveRolePrivileges: saveRolePrivileges,exportEmptyData:exportEmptyData }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(UserRoles);
