import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import axios from 'axios';

class Privilege extends React.Component {
    constructor(props) {
        super(props);
        var privilege = {};
        var permissions = []
        this.props.list.map((obj, idx) => {
            privilege[obj.sysname + '-' + obj.id] = obj.value
            permissions.push({ id: obj.id, value: obj.value, name:obj.sysname + '-' + obj.id })
        })
        this.state = JSON.parse(JSON.stringify(privilege));
        this.state.permissions = permissions;
        this.state.roleId = this.props.roleId;
        this.props.onChange(privilege);
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.list !== prevProps.list) {
            var privilege = {};
            var permissions = []
            this.props.list.map((obj, idx) => {
                privilege[obj.sysname + '-' + obj.id] = obj.value
                permissions.push({ id: obj.id, value: obj.value, name:obj.sysname + '-' + obj.id  })
            })
            let state = JSON.parse(JSON.stringify(privilege));
            state.permissions = permissions;
            this.setState(state);
            this.props.onChange(privilege);
        }
    }

    handleInputChange = (privilegeName, event) => {
  		const target = event.target;
      const name = event.target.name;
  		let value = target.value;
  		if(target.type == 'checkbox') {
  				value = (target.checked) ? 1 : 0;
  		}
  		this.setState({[name] : value});
      let permissions = this.state.permissions;
      var privilege = {};

      // if checked/un-checked privilage match with view-patients, view-appointments, view-sales, view-products-inventory then
      if(['view-patients', 'view-appointments', 'view-sales', 'view-products-inventory'].indexOf(privilegeName) > -1){
        // if parent privilage is un-checked then un-checked all child privilege
        if(!value){
          let privilege = {};
          let permissions = []
          this.props.list.map((obj, idx) => {
              privilege[obj.sysname + '-' + obj.id] = 0;//obj.value
              permissions.push({ id: obj.id, value: 0, name:obj.sysname + '-' + obj.id  })
          })
          let state = JSON.parse(JSON.stringify(privilege));
          state.permissions = permissions;
          this.props.onChange(privilege);
          this.setState(state);
          return
        } else {
  				// check 'view-sales-reports' privilage if only view-sales privilages are checked
  				if(this.props.module === 'sales'){
            let checkedSalesPrivilege = permissions.filter(x => x.value == 1 || x.value == true)
            if(checkedSalesPrivilege && checkedSalesPrivilege.length <= 1){
              permissions.map((obj,idx)=> {
                if (obj.name.startsWith('view-sales-report-')) {
                  permissions[idx].value = 1
                  privilege[obj.name] = 1
                  this.state[obj.name] = 1;
                }
              })
              this.props.onChange(privilege);
              return
            }
  				}
  			}
      } else {
        let parentPrivilege = null;
        let  parentPrivilegeName = null;
        let parentPrivilegeValue = null;

        let subParentPrivilege = null;
        let subParentPrivilegeName = null;
        let subParentPrivilegeValue = null;
        let childPrivilege = null
        let childPrivilegeName = null
        let childPrivilegeValue = null

        // if checked privilege does not belongs to settings privilege moule then get all privilege-list then
        parentPrivilege = (this.props.module != 'settings') ? this.props.list[0] : null
        if(parentPrivilege){
          parentPrivilegeName = parentPrivilege.sysname+ '-' + parentPrivilege.id;
          parentPrivilegeValue = this.state[parentPrivilegeName];
        }
        // if privilage is checked
        if(value == 1){
          // checked parent privilage if any child privilage is checked
          parentPrivilegeValue = (parentPrivilegeName) ? 1 : parentPrivilegeValue;
          // get sub-parent privilage for dependent child privileges
          if(privilegeName == "add-update-customer-notes"){
            subParentPrivilege = this.props.list.find(x => x.sysname =='view-customer-notes');
          } else if(privilegeName == "add-edit-procedure-notes"){
            subParentPrivilege = this.props.list.find(x => x.sysname =='view-procedure-notes');
          } else if(privilegeName == "delete-products"){
            subParentPrivilege = this.props.list.find(x => x.sysname =='add-update-products');
          } else if(privilegeName == "manage-provider-schedule"){
            subParentPrivilege = this.props.list.find(x => x.sysname =='view-provider-schedule');
          } else if(privilegeName == "manage-product-categories"){
            subParentPrivilege = this.props.list.find(x => x.sysname =='view-product-categories');
          } else if(privilegeName == "add-update-instructions"){
            subParentPrivilege = this.props.list.find(x => x.sysname =='manage-appointment-settings');
          } else if(privilegeName == "update-drawer-after-close"){
            subParentPrivilege = this.props.list.find(x => x.sysname =='view-cash-drawer');
          } else if(privilegeName == "invoice-provider-change"){
            subParentPrivilege = this.props.list.find(x => x.sysname =='view-sales-invoices');
          }

          // checked sub-parent privilage if any child privilage is checked
          if(subParentPrivilege){
            subParentPrivilegeName = subParentPrivilege.sysname+ '-' + subParentPrivilege.id;
            subParentPrivilegeValue = 1;
          }
        }else{
          // get child privilage for dependent sub-parent privileges
          if(privilegeName == "view-customer-notes"){
            childPrivilege = this.props.list.find(x => x.sysname =='add-update-customer-notes');
          } else if(privilegeName == "view-procedure-notes"){
            childPrivilege = this.props.list.find(x => x.sysname =='add-edit-procedure-notes');
          } else if(privilegeName == "add-update-products"){
            childPrivilege = this.props.list.find(x => x.sysname =='delete-products');
          } else if(privilegeName == "manage-appointment-settings"){
            childPrivilege = this.props.list.find(x => x.sysname =='add-update-instructions');
          } else if(privilegeName == "view-provider-schedule"){
            childPrivilege = this.props.list.find(x => x.sysname =='manage-provider-schedule');
          } else if(privilegeName == "view-product-categories"){
            childPrivilege = this.props.list.find(x => x.sysname =='manage-product-categories');
          } else if(privilegeName == "view-cash-drawer"){
            childPrivilege = this.props.list.find(x => x.sysname =='update-drawer-after-close');
          } else if(privilegeName == "view-sales-invoices"){
            childPrivilege = this.props.list.find(x => x.sysname =='invoice-provider-change');
          }

          // un-checked child privilage if any sub-parent privilage is un-checked
          if(childPrivilege){
            childPrivilegeName = childPrivilege.sysname+ '-' + childPrivilege.id;
            childPrivilegeValue = 0;
          }
        }


        permissions.map((obj,idx)=> {
          if(name == obj.name){
            permissions[idx].value = value
            privilege[obj.name] = value
          } else if(parentPrivilegeName == obj.name){
            this.state[parentPrivilegeName] = parentPrivilegeValue;
            permissions[idx].value = parentPrivilegeValue
            privilege[obj.name] = parentPrivilegeValue
          } else if(subParentPrivilegeName == obj.name){
            // checked sub-parent privilage if any child privilage is checked
            this.state[subParentPrivilegeName] = subParentPrivilegeValue;
            permissions[idx].value = subParentPrivilegeValue
            privilege[obj.name] = subParentPrivilegeValue
          } else if(childPrivilegeName == obj.name){
            // un-checked child privilage if any sub-parent privilage is un-checked
            this.state[childPrivilegeName] = subParentPrivilegeValue;
            permissions[idx].value = childPrivilegeValue
            privilege[obj.name] = childPrivilegeValue
          } else {
            privilege[obj.name] = obj.value
          }
        })

        // un-check 'view-sales' privilage if all child privilages are un-checked
        if(this.props.module === 'sales' && !value){
          let checkedSalesPrivilege = permissions.filter(x => x.value == 1 || x.value == true)
          if(checkedSalesPrivilege && checkedSalesPrivilege.length == 1){
            permissions[0]['value'] = 0;
            privilege[permissions[0]['name']] = 0;
            this.state[permissions[0]['name']] = 0;
          }
        }

        this.props.onChange(privilege);
        this.setState({permissions:permissions})
      }



  	}

    render() {
        return (
            <div>
                {this.props.list.map((obj, idx) => {
                    return (
                        <div className="privileges-row" key={obj.sysname}>
                            <input type="checkbox" className="new-check child_view-patients" name={obj.sysname + '-' + obj.id} checked={(this.state[obj.sysname + '-' + obj.id]) ? 'checked' : false} onChange={this.handleInputChange.bind(this,obj.sysname)} id={obj.sysname + '-' + obj.id} /><label className="setting-text" htmlFor={obj.sysname + '-' + obj.id} >{this.props.langData[obj.sysname]}</label>
                        </div>
                    )
                })
              }
            </div>
        )
    }
}

export default Privilege;
