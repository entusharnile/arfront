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
import { getUser, saveUserPrivileges,exportEmptyData} from '../../../../Actions/Settings/settingsActions.js';
import { isFormSubmit } from '../../../../Utils/services.js';
import axios from 'axios';

class UserPrivilege extends Component {

	constructor(props) {
		super(props);

		const globalPrivileges = JSON.parse(localStorage.getItem('globalPrivileges')).permissions;
		const languageData = JSON.parse(localStorage.getItem('languageData'))
		let userRole = parseInt(this.props.match.params.roleId);
		let allRoles = ['admin', 'provider', 'frontdesk', 'md'];
		let currentRolePermissions = {}
		if (userRole > 0 && userRole <= 4) {
			currentRolePermissions = globalPrivileges[allRoles[userRole - 1]];
		}
		this.state = {
			roles: ['admin', 'provider', 'frontdesk', 'md'],
			privilegeList: currentRolePermissions,
			showLoader: false,
			settingsLangData: languageData.settings,
			activeAdminRole: true,
			selectedPrivilege: [],
			selectedRoleId: 1,
			permissions: [],
			userPrivilegeList: []
		}
		localStorage.setItem('loadFresh', false);
		localStorage.setItem('sortOnly', false);

	}

	componentDidMount() {
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
			showLoader: true
		})
		this.props.getUser(this.props.match.params.id, 'user');
	}


	handleInputChange = (privilegeName,privilegeModule,event) => {
		const target = event.target;
		let value = target.value;
		switch (target.type) {
			case 'checkbox': {
				value = (target.checked) ? 1 : 0;
				break;
			}

			case 'radio': {
				value = target.value;
				break;
			}
		}
		this.setState({userChanged: true });
		this.state[event.target.name] = value

		// fetch privilage-list dependent on moule
		const privilageList = this.state.privilegeList[privilegeModule];
		// if checked/un-checked privilage match with view-patients, view-appointments, view-sales, view-products-inventory then
		if(['view-patients', 'view-appointments', 'view-sales', 'view-products-inventory'].indexOf(privilegeName) > -1){
			// if parent privilage is un-checked then un-checked all child privilege
			if(!value){
				let permissions = []
				privilageList.map((obj, idx) => {
						permissions['p_'+obj]  = 0
				})
				this.setState(permissions);
				return
			} else {
				// check 'view-sales-reports' privilage if only view-sales privilages are checked
				if(privilegeModule === 'sales'){
					let checkedSalesPrivilege = privilageList.filter(x => (this.state['p_'+x]) && (this.state['p_'+x] == 1 || this.state['p_'+x] == true))
					if(checkedSalesPrivilege && checkedSalesPrivilege.length == 1){
						this.state['p_view-sales-report'] = 1;
					}
				}
			}
		} else {
			// if privilage is checked
			if(value){
				// if checked privilege does not belongs to settings privilege moule then get all privilege-list then
				const parentPrivilege = (privilegeModule != 'settings') ? privilageList[0] : null
				// checked parent privilage if any child privilage is checked
				if(parentPrivilege){
					this.state['p_'+parentPrivilege] = 1;
				}

				// get sub-parent privilage for dependent child privileges
				let subParentPrivilege = null;
				if(privilegeName == "add-update-customer-notes"){
					subParentPrivilege = privilageList.find(x => x =='view-customer-notes');
				} else if(privilegeName == "add-edit-procedure-notes"){
					subParentPrivilege = privilageList.find(x => x =='view-procedure-notes');
				} else if(privilegeName == "delete-products"){
					subParentPrivilege = privilageList.find(x => x =='add-update-products');
				} else if(privilegeName == "manage-provider-schedule"){
					subParentPrivilege = privilageList.find(x => x =='view-provider-schedule');
				} else if(privilegeName == "manage-product-categories"){
					subParentPrivilege = privilageList.find(x => x =='view-product-categories');
				} else if(privilegeName == "add-update-instructions"){
					subParentPrivilege = privilageList.find(x => x =='manage-appointment-settings');
				} else if(privilegeName == "update-drawer-after-close"){
					subParentPrivilege = privilageList.find(x => x =='view-cash-drawer');
				} else if(privilegeName == "invoice-provider-change"){
					subParentPrivilege = privilageList.find(x => x =='view-sales-invoices');
				}
				// checked sub-parent privilage if any child privilage is checked
				if(subParentPrivilege){
					this.state['p_'+subParentPrivilege] = 1;
				}

			}else{
				// get child privilage for dependent sub-parent privileges
				 let childPrivilege = null
					if(privilegeName == "view-customer-notes"){
						childPrivilege = privilageList.find(x => x =='add-update-customer-notes');
					} else if(privilegeName == "view-procedure-notes"){
						childPrivilege = privilageList.find(x => x =='add-edit-procedure-notes');
					} else if(privilegeName == "add-update-products"){
						childPrivilege = privilageList.find(x => x =='delete-products');
					} else if(privilegeName == "manage-appointment-settings"){
						childPrivilege = privilageList.find(x => x =='add-update-instructions');
					} else if(privilegeName == "view-provider-schedule"){
						childPrivilege = privilageList.find(x => x =='manage-provider-schedule');
					} else if(privilegeName == "view-product-categories"){
						childPrivilege = privilageList.find(x => x =='manage-product-categories');
					} else if(privilegeName == "view-cash-drawer"){
            childPrivilege = privilageList.find(x => x =='update-drawer-after-close');
          } else if(privilegeName == "view-sales-invoices"){
            childPrivilege = privilageList.find(x => x =='invoice-provider-change');
          }
					// un-checked cild privilage if any sub-parent privilage is un-checked
					if(childPrivilege){
						this.state['p_'+childPrivilege] = 0;
					}

					// un-check 'view-sales' privilage if all child privilages are un-checked
	        if(privilegeModule === 'sales'){
	          let checkedSalesPrivilege = privilageList.filter(x => (this.state['p_'+x]) && (this.state['p_'+x] == 1 || this.state['p_'+x] == true))
	          if(checkedSalesPrivilege && checkedSalesPrivilege.length == 1){
	            this.state['p_view-sales'] = 0;
	          }
	        }
			}
		}

	}

	savePrivileges = () => {
		if(isFormSubmit()){
			localStorage.setItem('showLoader', true);
			let permissions = [];
			for (let x in this.state) {
				if (x.startsWith('p_') && this.state[x] == 1) {
					permissions.push(x.split('p_')[1])
				}
			}

			let formData = { user_id: this.props.match.params.id, privileges: permissions };

			this.setState({ 'showLoader': true })
			this.props.saveUserPrivileges(formData)
		}
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
				nextProps.exportEmptyData()
	        return {showLoader : false};
	     }
		if (nextProps.userData != undefined && nextProps.userData.privileges !== prevState.userPrivilegeList) {
			let returnState = {},
				p = nextProps.userData.privileges;
			if (p.length) {
				p.map((obj, idx) => {
					returnState["p_" + obj] = 1
				})
			}
			returnState.name = nextProps.userData.firstname + " " + nextProps.userData.lastname
			returnState.userPrivilegeList = p;
			returnState.showLoader = false;
			nextProps.exportEmptyData()
			return returnState
		}
		return {}
	}

	render() {
		let appointmentsPrivilege = []
		if(this.state.privilegeList && this.state.privilegeList['appointments']){
			let notDesiredSysname = ['update-cancel-reschedule-appointment', 'manage-services', 'manage-Services-Packages', 'manage-provider-schedule', 'manage-equipments-schedule', 'manage-resource-schedule', 'view-provider-schedule'];
			this.state.privilegeList['appointments'].map((obj, idx) => {
				if(notDesiredSysname.indexOf(obj) > -1){

				} else {
					appointmentsPrivilege.push(obj)
				}
			})
		}


		return (
			<div id="content">
				<div className="container-fluid content setting-wrapper">
					<Sidebar />
					<div className="setting-setion">
						<div className="setting-container">
							<div className="setting-title">{this.state.settings_edit_privileges}: {this.state.name}
								<Link to={"/settings/users/" + this.props.match.params.id + "/edit"} className="pull-right crossIcon cancelAction"><img src="/images/close.png" /></Link>
							</div>
							<div className="row">
								<div className="col-lg-12 col-md-12" id="ajax_view">
									<div className="row">
										<div className="col-lg-4 col-md-6">
											<div className="previlage-ouer-section">
												<div className="settings-subtitle m-b-20">{this.state.privilegeList['patients-management'] && this.state.settingsLangData['patients-management']}</div>
												{this.state.privilegeList['patients-management']
													&&
													this.state.privilegeList['patients-management'].map((obj, idx) => {
														return (
															<div className="privileges-row" key={obj}>
																<input type="checkbox" className="new-check child_view-patients" name={"p_" + obj} checked={this.state["p_" + obj]} onChange={this.handleInputChange.bind(this,obj,'patients-management')} /><label className="setting-text" htmlFor={obj}>{this.state.settingsLangData[obj]}</label>
															</div>
														)
													})
												}

											</div>
										</div>
										<div className="col-lg-4 col-md-6">
											<div className="previlage-ouer-section">
												<div className="settings-subtitle m-b-20">{this.state.privilegeList['appointments'] && this.state.settingsLangData['appointments']}</div>
												{this.state.privilegeList['appointments']
													&&
													appointmentsPrivilege.map((obj, idx) => {
														return (
															<div className="privileges-row" key={obj}>
																<input type="checkbox" className="new-check child_view-patients" name={"p_" + obj} checked={this.state["p_" + obj]} onChange={this.handleInputChange.bind(this,obj,'appointments')} /><label className="setting-text" htmlFor={obj}>{this.state.settingsLangData[obj]}</label>
															</div>
														)
													})
												}
											</div>
											<div className="previlage-ouer-section">
												<div className="settings-subtitle m-b-20">{this.state.privilegeList['settings'] && this.state.settingsLangData['settings']}</div>
												{this.state.privilegeList['settings']
													&&
													this.state.privilegeList['settings'].map((obj, idx) => {
														return (
															<div className="privileges-row" key={obj}>
																<input type="checkbox" className="new-check child_view-patients" name={"p_" + obj} checked={this.state["p_" + obj]} onChange={this.handleInputChange.bind(this,obj,'settings')} /><label className="setting-text" htmlFor={obj}>{this.state.settingsLangData[obj]}</label>
															</div>
														)
													})
												}
											</div>
										</div>
										<div className="col-lg-4 col-md-6">
											<div className="previlage-ouer-section">
												<div className="settings-subtitle m-b-20">{this.state.privilegeList['sales'] && this.state.settingsLangData['sales']}</div>
												{this.state.privilegeList['sales']
													&&
													this.state.privilegeList['sales'].map((obj, idx) => {
														return (
															<div className="privileges-row" key={obj}>
																<input type="checkbox" className="new-check child_view-patients" name={"p_" + obj} checked={this.state["p_" + obj]} onChange={this.handleInputChange.bind(this,obj,'sales')} /><label className="setting-text" htmlFor={obj}>{this.state.settingsLangData[obj]}</label>
															</div>
														)
													})
												}
											</div>
											<div className="previlage-ouer-section">
												<div className="settings-subtitle m-b-20">{this.state.privilegeList['inventory-management'] && this.state.settingsLangData['inventory-management']}</div>
												{this.state.privilegeList['inventory-management']
													&&
													this.state.privilegeList['inventory-management'].map((obj, idx) => {
														return (
															<div className="privileges-row" key={obj}>
																<input type="checkbox" className="new-check child_view-patients" name={"p_" + obj} checked={this.state["p_" + obj]} onChange={this.handleInputChange.bind(this,obj,'inventory-management')} /><label className="setting-text" htmlFor={obj}>{this.state.settingsLangData[obj]}</label>
															</div>
														)
													})
												}

											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="footer-static">
							<a id="save_role" className="new-blue-btn pull-right" onClick={this.savePrivileges}>{this.state.user_save_btn_text}</a>
							<a href={"/settings/users/" + this.props.match.params.id + "/edit" } className="cancelAction new-white-btn pull-right">Cancel</a>

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
	if (state.SettingReducer.action === "USER_GET") {
		if(state.SettingReducer.data.status != 200){
			returnState.showLoader = false
			toast.dismiss()
			toast.error(languageData.global[state.SettingReducer.data.message]);
		}
		else {
			returnState.userData= state.SettingReducer.data.data
		}
	}
	if (state.SettingReducer.action === "USER_PRIVILEGE_UPDATE") {
		if (state.SettingReducer.data.status != 200) {
			toast.dismiss()
			toast.error(languageData.global[state.SettingReducer.data.message]);
			returnState.showLoader = false
		}
		else {
			returnState.showLoader = false
			toast.dismiss()
			toast.success(languageData.global[state.SettingReducer.data.message]);
		}
	}
	return returnState;
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ saveUserPrivileges: saveUserPrivileges, getUser: getUser,exportEmptyData:exportEmptyData }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(UserPrivilege);
