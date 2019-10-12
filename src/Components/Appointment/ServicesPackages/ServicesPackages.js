import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import { ToastContainer, toast } from "react-toastify";
import { fetchServicesPackages} from '../../../Actions/Appointment/appointmentAction.js';
import AppointmentHeader from '../AppointmentHeader.js'
import { checkIfPermissionAllowed} from '../../../Utils/services.js';

class ServicesPackages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page:1,
      pagesize:10,
      next_page_url: '',
      startFresh: true,
      showLoadingText : false,
      loadMore: true,
      showLoader : false,
      servicesPackagesList:[],
      next_page_url:'',
      sortorder: "asc",
      sortby: "name",
    }
    localStorage.setItem('loadFresh', false);
    localStorage.setItem('sortOnly', false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.next_page_url != null) {
        this.loadMore();
      }
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.setState({
      appointment_services_packages: languageData.appointments['appointment_services_packages'],
      appointment_create_package: languageData.appointments['appointment_create_package'],
      appointment_package_name: languageData.appointments['appointment_package_name'],
      label_hrs: languageData.global['label_hrs'],
      label_mins: languageData.global['label_mins'],
      label_action: languageData.global['label_action'],
      label_active: languageData.global['label_active'],
      label_clone: languageData.global['label_clone'],
      label_yes: languageData.global['label_yes'],
      label_no: languageData.global['label_no'],
      label_search: languageData.global['label_search'],
      loading_please_wait_text: languageData.global['loading_please_wait_text'],
      Please_Wait: languageData.global['Please_Wait'],
      sorry_no_record_found: languageData.global['sorry_no_record_found'],
    });

    document.addEventListener('click', this.handleClick, false);
    let formData = {'params':{
        term        : this.state.term,
        page        : this.state.page,
        pagesize    : this.state.pagesize,
        sortorder    : this.state.sortorder,
        sortby    : this.state.sortby,
      }
    }
    this.setState({'showLoader': true})
    this.props.fetchServicesPackages(formData);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
      return returnState;
   }
    if (
      nextProps.servicesPackagesList != undefined &&
      nextProps.servicesPackagesList.packages.next_page_url !== prevState.next_page_url
    ) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        returnState.next_page_url = null;
        return returnState;
      }
      if (prevState.servicesPackagesList.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.servicesPackagesList = nextProps.servicesPackagesList.packages.data;
          if (nextProps.servicesPackagesList.packages.next_page_url != null) {
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.servicesPackagesList.packages.next_page_url;
          }
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
          localStorage.setItem('showLoader', false);
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (
        prevState.servicesPackagesList != nextProps.servicesPackagesList.packages.data &&
        prevState.servicesPackagesList.length != 0
      ) {
        returnState.servicesPackagesList = [
          ...prevState.servicesPackagesList,
          ...nextProps.servicesPackagesList.packages.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.servicesPackagesList.packages.next_page_url;
        localStorage.setItem('showLoader', false);
        returnState.showLoader = false;
        returnState.showLoadingText = false;
      }
      return returnState;
    }

    return null;
  }

 /* componentWillUnmount = () => {
   window.onscroll = () => {
     return false;
   }
  }*/

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({
        [event.target.name]: value
    });

    if ( event.target.name === 'object_name' ) {
      this.handleSubmit(event, value)
    }
  }

  handleSubmit = event => {
    event.preventDefault();
    localStorage.setItem("sortOnly", true);
    let formData = {
      params: {
        page: 1,
        pagesize: this.state.pagesize,
        term: this.state.term,
        sortorder    : this.state.sortorder,
        sortby    : this.state.sortby,
      }
    };
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      startFresh: true,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      servicesPackagesList: [],
      showLoader:true,
      next_page_url:''
    });
    this.setState({'showLoader': true});
    this.props.fetchServicesPackages(formData);
  };

  ServicesPackagesCreate = serviceCategoryId => {
    this.props.openCreatePackage('create');
  };

  ServicesPackagesClone =  (id,event) => {
      this.props.openCreatePackage('clone', id);
  };

  ServicesPackagesEdit = (id,event) => {
    if(event.target.className != 'easy-link'){
      this.props.openCreatePackage('edit', id);
    }
    return;
  };

  loadMore = () => {
      this.setState({'loadMore': true, startFresh: true, showLoader: false, showLoadingText: true})
      let formData = {'params':{
          term        : this.state.term,
          page        : this.state.page,
          pagesize    : this.state.pagesize,
          sortorder    : this.state.sortorder,
          sortby    : this.state.sortby,
        }
      }
      this.props.fetchServicesPackages(formData,this.state.serviceCategoryId);
  }

  openServices = () => {
    this.props.openServices();
  }

  render() {

    return (
    <div className="setting-setion">
    <div class="appointment-container">
      <ul class="appointment-tabs">
        <li><a className="" onClick={this.openServices}> Services</a></li>
        <li><a className="active"  >Services Packages</a></li>
      </ul>
      <div className="setting-search-outer no-padding">
        <form onSubmit={this.handleSubmit}>
          <div className="search-bg new-search">
              <i className="fas fa-search" />
              <input className="setting-search-input search-key"  name="term"  placeholder={this.state.label_search} value={this.state.term} onChange={this.handleInputChange} autoComplete="off" />
          </div>
        </form>
        {checkIfPermissionAllowed("manage-Services-Packages") &&
          <a href="javascript:void(0);" onClick={this.ServicesPackagesCreate.bind()} className="new-blue-btn pull-right">{this.state.appointment_create_package}</a>
        }
      </div>
      <div className="table-responsive appointmenTable">
        <table className="table-updated juvly-table table-min-width">
          <thead className="table-updated-thead">
            <tr>
              <th className="col-xs-3 table-updated-th">{this.state.appointment_package_name}</th>
              <th className="col-xs-2 table-updated-th">{this.state.label_hrs}</th>
							<th className="col-xs-2 table-updated-th">{this.state.label_mins}</th>
							<th className="col-xs-2 table-updated-th">{this.state.label_active}</th>
							<th className="col-xs-2 table-updated-th">{this.state.label_action}</th>
            </tr>
          </thead>
          <tbody>
            {this.state.servicesPackagesList.length > 0 ?

                this.state.servicesPackagesList.map((obj, idx) => {
                  return (
                    <tr key={'fragment_'+idx} className="table-updated-tr"  data-order_by={obj.id}  >
                      <td className="col-xs-3 table-updated-td" onClick={this.ServicesPackagesEdit.bind(this, obj.id)}>{obj.name}</td>
                      <td className="col-xs-2 table-updated-td" onClick={this.ServicesPackagesEdit.bind(this, obj.id)}> {Math.floor(obj.duration/60)}</td>
                      <td className="col-xs-2 table-updated-td" onClick={this.ServicesPackagesEdit.bind(this, obj.id)}>{Math.floor(obj.duration%60)}</td>
                      <td className="col-xs-2 table-updated-td" onClick={this.ServicesPackagesEdit.bind(this, obj.id)}>{(obj.is_active) ? this.state.label_yes : this.state.label_no}</td>
                      <td className="col-xs-2 table-updated-td" ><a href="javascript:void(0);" onClick={this.ServicesPackagesClone.bind(this, obj.id)} className="easy-link no-padding-left">{this.state.label_clone}</a></td>
                    </tr>
                  )
                })
              :
                <tr className={(!this.state.showLoader) ? 'table-updated-tr' : 'table-updated-tr no-display'}>
                  <td className="col-xs-12 table-updated-td text-center" colSpan="7">{this.state.sorry_no_record_found}</td>
                </tr>
            }
          </tbody>
        </table>
      </div>
      <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
        <div className="loader-outer">
          <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
          <div id="modal-confirm-text" className="popup-subtitle" >{this.state.Please_Wait}</div>
        </div>
      </div>
    </div>
    <div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display"}>{this.state.loading_please_wait_text}</div>
  </div>
    );
  }
}

function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem("languageData"));
  if (state.AppointmentReducer.action === 'SERVICES_PACKAGES_LIST' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.servicesPackagesList = state.AppointmentReducer.data.data;
    }
  } else if (state.AppointmentReducer.action === "SERVICE_SORT_ORDER_UPDATE") {
    if (state.AppointmentReducer.data.status == 200) {
      toast.success(languageData.global[state.AppointmentReducer.data.message]);
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  }
  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchServicesPackages: fetchServicesPackages
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps) (ServicesPackages);
