import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../../Containers/Protected/Header.js';
import Footer from '../../Containers/Protected/Footer.js';
import { viewChanges,exportCsv} from '../../Actions/Dashboard/dashboardActions.js';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DefinedRange, DateRangePicker } from 'react-date-range';
import calenLogo from '../../images/calender.svg';
import { format, addDays } from 'date-fns';
import { Link } from 'react-router-dom'
import { showFormattedDate } from "../../Utils/services.js";

class ViewComparison extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      showLoader: false,
      userChanged: false,
      viewChangesData :{},
      exportCsvData:{},
      globalLang: languageData.global,
      dashboardLang: languageData.dashboard,
    }
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({
        [event.target.name]: value,userChanged : true
    });

    if ( event.target.name === 'object_name' ) {
      this.handleSubmit(event, value)
    }
  }

  handleSubmit = (event, value) => {
    let from_date   = ''
    let to_date     = ''
    let object_name = 'undefined'

    if (typeof event === 'object' ) {
      event.preventDefault();
      object_name = value
    } else {
      from_date = value.from_date
      to_date   = value.to_date
    }

    let formData = {'params':{
        to_date     : (to_date) ? to_date : this.state.to_date,
        from_date   : (from_date) ? from_date : this.state.from_date,
        term        : this.state.term,
        object_name : (object_name !== 'undefined') ? object_name : this.state.object_name,
        page        : 1,
        pagesize    : this.state.pagesize,
      }
    }

    this.setState({
      page          : 1,
      pagesize      : this.state.pagesize,
      loadMore      : true,
      startFresh    : true,
      next_page_url : '',
      showLoader    : true,
      objectNames   : [],
      userLogList   : [],
      dataFiltered  : true
    });

    {/*this.props.viewChanges(formData);*/}
  }

  componentDidMount() {
  let objectType =this.props.match.params.object_type;
    let childId =this.props.match.params.child_id;
    let objectId =this.props.match.params.object_id;

    let formData = {'params':{
        to_date     : this.state.to_date,
        from_date   : this.state.from_date,
        term        : this.state.term,
        object_name : this.state.object_name,
        page        : this.state.page,
        pagesize    : this.state.pagesize
      }
    }

    document.addEventListener('click', this.handleClick, false);

    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({
      view_before_update: languageData.dashboard['view_before_update'],
      view_after_update: languageData.dashboard['view_after_update'],
      view_service_name: languageData.dashboard['view_service_name'],
      view_service_category: languageData.dashboard['view_service_category'],
      view_available_clinics: languageData.dashboard['view_available_clinics'],
      view_is_service_dependent: languageData.dashboard['view_is_service_dependent'],
      view_book_appointment: languageData.dashboard['view_book_appointment'],
      view_card_capture: languageData.dashboard['view_card_capture'],
      view_is_free_service: languageData.dashboard['view_is_free_service'],
      view_questionnaires: languageData.dashboard['view_questionnaires'],
      view_providers: languageData.dashboard['view_providers'],
      view_resources: languageData.dashboard['view_resources'],
      view_survey: languageData.dashboard['view_survey'],
      view_cant_book: languageData.dashboard['view_cant_book'],
      view_pre_treatment: languageData.dashboard['view_pre_treatment'],
      view_post_treatment:languageData.dashboard['view_post_treatment'],
      view_description: languageData.dashboard['view_description'],
      view_done_by: languageData.dashboard['view_done_by'],
      view_action_perform: languageData.dashboard['view_action_perform'],
      view_done_on: languageData.dashboard['view_done_on'],
      view_comparison_header: languageData.dashboard['view_comparison_header'],
      view_duration:languageData.dashboard['view_duration'],
    })
    this.setState({'showLoader': true})
    this.props.viewChanges(objectType,childId,objectId);
  }

  static getDerivedStateFromProps(props, state) {
    if(props.showLoader != undefined && props.showLoader == false) {
        return {showLoader : false};
     }
      if(props.viewChangesData !== undefined && props.viewChangesData.status === 200){
          return{
            service_name1: props.viewChangesData.data[1] ? props.viewChangesData.data[1].service_name : (props.viewChangesData.data.before ? props.viewChangesData.data.before.patient_name : '') ,
            service_name2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].service_name : (props.viewChangesData.data.after ? props.viewChangesData.data.after.patient_name : ''),
            category_names1: props.viewChangesData.data[1] ? props.viewChangesData.data[1].category_names : '',
            clinic_names1: props.viewChangesData.data[1] ? props.viewChangesData.data[1].clinic_names : '',
            devices1: props.viewChangesData.data[1] ? ((props.viewChangesData.data[1].is_device_dependent === "1") ?  props.viewChangesData.data[1].device_names : props.viewChangesData.data[1].is_device_dependent) : '' ,
            is_available_online1: props.viewChangesData.data[1] ? props.viewChangesData.data[1].is_available_online : '',
            is_service_free1:props.viewChangesData.data[1] ? props.viewChangesData.data[1].is_service_free : '',
            questionnaires1: props.viewChangesData.data[1] ? props.viewChangesData.data[1].questionnaire_names : '',
            provider_names1: props.viewChangesData.data[1] ?  props.viewChangesData.data[1].provider_names : '',
            resources1: props.viewChangesData.data[1] ? props.viewChangesData.data[1].resource_names : '',
            serveys1: props.viewChangesData.data[1] ? ((props.viewChangesData.data[1].serveys) ? props.viewChangesData.data[1].survey_names : 0) : '',
            not_clubbed_services1: props.viewChangesData.data[1] ? props.viewChangesData.data[1].not_clubbed_service_names : '',
            pre_treatment_names1: props.viewChangesData.data[1] ? props.viewChangesData.data[1].pre_treatment_names : '',
            post_treatment_names1: props.viewChangesData.data[1] ? props.viewChangesData.data[1].post_treatment_names : '',
            duration1: props.viewChangesData.data[1] ? props.viewChangesData.data[1].duration : '',
            description1:props.viewChangesData.data[1] ? props.viewChangesData.data[1].description : '',
            action1: props.viewChangesData.data[1] ? props.viewChangesData.data[1].action : '',
            created1: props.viewChangesData.data[1] ? props.viewChangesData.data[1].created : '',
            name1: (props.viewChangesData.data[1]  && props.viewChangesData.data[1].done_by_user) ? props.viewChangesData.data[1].done_by_user.firstname + ' '+props.viewChangesData.data[1].done_by_user.lastname : (props.viewChangesData.data.before ? props.viewChangesData.data.before.done_by : ''),
            free_consultation1: props.viewChangesData.data[1] ? props.viewChangesData.data[1].free_consultation : '',
            free_consultation2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].free_consultation : '',
            category_names2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].category_names : '',
            clinic_names2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].clinic_names : '',
            devices2: props.viewChangesData.data[0] ? ((props.viewChangesData.data[0].is_device_dependent === "1") ?  props.viewChangesData.data[0].device_names : props.viewChangesData.data[0].is_device_dependent) : '' ,
            is_available_online2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].is_available_online : '',
            is_service_free2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].is_service_free : '',
            questionnaires2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].questionnaire_names : '',
            provider_names2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].provider_names : '',
            resources2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].resource_names : '',
            serveys2: props.viewChangesData.data[0] ?  ((props.viewChangesData.data[0].serveys) ? props.viewChangesData.data[0].survey_names : 0) : '',
            not_clubbed_services2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].not_clubbed_service_names : '',
            pre_treatment_names2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].pre_treatment_names : '',
            post_treatment_names2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].post_treatment_names : '',
            duration2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].duration : '',
            description2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].description : '',
            action2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].action : '',
            created2: props.viewChangesData.data[0] ? props.viewChangesData.data[0].created : '',
            name2:( props.viewChangesData.data[0] && props.viewChangesData.data[0].done_by_user) ? props.viewChangesData.data[0].done_by_user.firstname + ' '+ props.viewChangesData.data[0].done_by_user.lastname : (props.viewChangesData.data.after ? props.viewChangesData.data.after.done_by : ''),
            patient_email_after: (props.viewChangesData.data.after ? props.viewChangesData.data.after.patient_email : ''),
            patient_email_before: (props.viewChangesData.data.before ? props.viewChangesData.data.before.patient_email : ''),
            phone_number_after: (props.viewChangesData.data.after ? props.viewChangesData.data.after.phone_number : ''),
            phone_number_before: (props.viewChangesData.data.before ? props.viewChangesData.data.before.phone_number : ''),
            appointment_notes_after: (props.viewChangesData.data.after ? props.viewChangesData.data.after.notes : ''),
            appointment_notes_before: (props.viewChangesData.data.before ? props.viewChangesData.data.before.notes : ''),
            clinic_after: (props.viewChangesData.data.after ? props.viewChangesData.data.after.clinic : ''),
            clinic_before: (props.viewChangesData.data.before ? props.viewChangesData.data.before.clinic : ''),
            services_after:(props.viewChangesData.data.after ? props.viewChangesData.data.after.services : ''),
            services_before: (props.viewChangesData.data.before ? props.viewChangesData.data.before.services : ''),
            packages_after: (props.viewChangesData.data.after ? props.viewChangesData.data.after.packages : ''),
            packages_before: (props.viewChangesData.data.before ? props.viewChangesData.data.before.packages : ''),
            provider_after: (props.viewChangesData.data.after ? props.viewChangesData.data.after.provider : ''),
            provider_before: (props.viewChangesData.data.before ? props.viewChangesData.data.before.provider : ''),
            appointment_datetime_after: (props.viewChangesData.data.after ? props.viewChangesData.data.after.appointment_datetime : ''),
            appointment_datetime_before: (props.viewChangesData.data.before ? props.viewChangesData.data.before.appointment_datetime : ''),
            action_after: (props.viewChangesData.data.after ? props.viewChangesData.data.after.action : ''),
            action_before: (props.viewChangesData.data.before ? props.viewChangesData.data.before.action : '')
          }
        }
    else
      return null;
  }

handleLoader = (e)=>{
  this.setState({'showLoader': false})
}
  render() {
    var urlR = window.location.href;
    var res = urlR.split("/");
    let navLink = res[res.length-3];
    console.log(navLink);
    return (
      <div id="content">
      <div className="wide-popup">
    		<div className="modal-blue-header">
    			<Link to="/dashboard/user-logs" onClick={this.handleLoader} className="popup-cross">×</Link>

    			<span className="popup-blue-name">{navLink=="appointment"? 'View Appointment Comparison' : "View Comparison" }</span>

    			<div className="popup-new-btns">

    				{/*<a href="#" className="new-blue-btn">Sign</a>*/}

    			</div>
    		</div>
      <div className="wide-popup-wrapper">
       <div className="container-fluid content setting-wrapper">
         <div className="wide-popup">
           <div className="modal-blue-header">
             <a href="#" className="popup-cross">×</a>
             <span className="popup-blue-name">{this.state.view_comparison_header}</span>
           </div>

           <div className="wide-popup-wrapper time-line" >
             <div className="table-responsive">

               <div className="table com-noti-outer" >
                 <div className="table-row com-notification">
                   <div className="table-cell" style={{width: '266px'}} />
                   <div className="table-cell" style={{width: '266px'}}>
                     <span className="priv-text-color">{this.state.view_before_update}</span>
                   </div>
                   <div className="table-cell" style={{width: '266px'}}>
                     <span className="priv-text-color">{this.state.view_after_update}</span>
                   </div>
                 </div>
                 <div className="table-row com-notification"><label className="table-cell com-noti-label">{navLink=="appointment"? this.state.dashboardLang.dashboard_patient_name : this.state.view_service_name }</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.service_name1}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.service_name2}</span>
                   </div>
                 </div>
                 <div className="table-row com-notification"><label className="table-cell com-noti-label">{navLink=="appointment"? this.state.dashboardLang.dashboard_patient_email : this.state.view_service_category }</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{navLink=="appointment"? this.state.patient_email_before : this.state.category_names1}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{navLink=="appointment"? this.state.patient_email_after : this.state.category_names2}</span>
                   </div>
                 </div>
                 <div className="table-row com-notification"><label className="table-cell com-noti-label">{ navLink=="appointment" ? this.state.dashboardLang.dashboard_patient_phone : this.state.view_available_clinics}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{navLink=="appointment"? this.state.phone_number_before : this.state.clinic_names1}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{navLink=="appointment"? this.state.phone_number_after : this.state.clinic_names2}</span>
                   </div>
                 </div>
                 <div className={navLink=="appointment"? "no-display" : "table-row com-notification"} ><label className="table-cell com-noti-label">{this.state.view_is_service_dependent}</label>
                   <div className="table-cell">
                     <span className="priv-text-color" >{this.state.devices1 == 0 ? '' : this.state.devices1}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color" >{this.state.devices2 == 0 ? '' : this.state.devices2}</span>
                   </div>
                 </div>
                 <div className={navLink=="appointment"? "no-display" : "table-row com-notification"}><label className="table-cell com-noti-label">{this.state.view_book_appointment}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.is_available_online1 == 0 ? 'No' : 'Yes'}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.is_available_online2 == 0 ? 'No' : 'Yes'}</span>
                   </div>
                 </div>

                 <div className={navLink=="appointment"? "no-display" : "table-row com-notification"}><label className="table-cell com-noti-label">{this.state.view_card_capture}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.is_service_free1 == 0 ? 'No' : 'Yes'}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.is_service_free2 == 0 ? 'No' : 'Yes'}</span>
                   </div>
                 </div>
                 <div className={navLink=="appointment"? "no-display" : "table-row com-notification"}><label className="table-cell com-noti-label">{this.state.view_is_free_service}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.free_consultation1 == 0 ? 'No' : 'Yes'}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.free_consultation2 == 0 ? 'No' : 'Yes'}</span>
                   </div>
                 </div>
                 <div className="table-row com-notification"><label className="table-cell com-noti-label">{ navLink=="appointment" ? this.state.dashboardLang.dashboard_appointment_notes : this.state.view_questionnaires}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{navLink=="appointment" ? this.state.appointment_notes_before : this.state.questionnaires1}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{ navLink=="appointment" ? this.state.appointment_notes_after : this.state.questionnaires2}</span>
                   </div>
                 </div>
                 <div className="table-row com-notification"><label className="table-cell com-noti-label">{ navLink=="appointment" ? this.state.dashboardLang.dash_userlog_opt_menu_clinic_text : this.state.view_providers}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{ navLink=="appointment" ? this.state.clinic_before : this.state.provider_names1}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{ navLink=="appointment" ? this.state.clinic_after : this.state.provider_names2}</span>
                   </div>
                 </div>
                 <div className="table-row com-notification"><label className="table-cell com-noti-label">{navLink=="appointment" ? this.state.dashboardLang.appointment_services : this.state.view_resources}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{navLink=="appointment" ? this.state.services_before :this.state.resources1}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{navLink=="appointment" ? this.state.services_after :this.state.resources2}</span>
                   </div>
                 </div>
                 <div className="table-row com-notification"><label className="table-cell com-noti-label">{ navLink=="appointment" ? this.state.dashboardLang.dashboard_packages : this.state.view_survey}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{ navLink=="appointment" ? this.state.packages_before : this.state.serveys1 == 0 ? '' : this.state.serveys1}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{ navLink=="appointment" ? this.state.packages_after : this.state.serveys2 == 0 ? '' : this.state.serveys2}</span>
                   </div>
                 </div>
                 <div className="table-row com-notification"><label className="table-cell com-noti-label">{ navLink=="appointment" ? this.state.dashboardLang.view_providers : this.state.view_cant_book}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{ navLink=="appointment" ? this.state.provider_before  : this.state.not_clubbed_services1}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{ navLink=="appointment" ? this.state.provider_after : this.state.not_clubbed_services2}</span>
                   </div>
                 </div>

                 <div className="table-row com-notification"><label className="table-cell com-noti-label">{ navLink=="appointment" ? this.state.dashboardLang.dashboard_appointment_date_time : this.state.view_pre_treatment}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{navLink=="appointment" ? showFormattedDate(this.state.appointment_datetime_before , true) :this.state.pre_treatment_names1}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{ navLink=="appointment" ? showFormattedDate(this.state.appointment_datetime_after, true) :this.state.pre_treatment_names2}</span>
                   </div>
                 </div>
                 <div className="table-row com-notification"><label className="table-cell com-noti-label">{ navLink=="appointment" ? this.state.dashboardLang.dashboard_action : this.state.view_post_treatment}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{ navLink=="appointment" ? this.state.action_before : this.state.post_treatment_names1}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{ navLink=="appointment" ? this.state.action_after : this.state.post_treatment_names2}</span>
                   </div>
                 </div>
                 <div className={navLink=="appointment"? "no-display" :"table-row com-notification"}><label className="table-cell com-noti-label">{this.state.view_duration}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.duration1}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.duration2}</span>
                   </div>
                 </div>
                 <div className= {navLink=="appointment" ? "no-display" : "table-row com-notification"}><label className="table-cell com-noti-label">{this.state.view_description}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.description1}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.description2}</span>
                   </div>
                 </div>
                 <div className="table-row com-notification"><label className="table-cell com-noti-label">{this.state.view_done_by}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.name1}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.name2}</span>
                   </div>
                 </div>
                 <div className= {navLink=="appointment"? "no-display" : "table-row com-notification"}><label className="table-cell com-noti-label">{this.state.view_action_perform}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.action1}</span>
                   </div>
                   <div className="table-cell">
                     <span className="priv-text-color">{this.state.action2}</span>
                   </div>
                 </div>
                 <div className="table-row com-notification"><label className="table-cell com-noti-label">{this.state.view_done_on}</label>
                   <div className="table-cell">
                     <span className="priv-text-color">{showFormattedDate(this.state.created1,true)}</span>
                   </div>
                    <div className="table-cell">
                      <span className="priv-text-color">{showFormattedDate(this.state.created2,true)}</span>
                     </div>
                   </div>
                 </div>
               </div>
              </div>
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
  if ( state.DashboardReducer.action === 'VIEW_CHANGES' ) {
    if (state.DashboardReducer.data.status != 200)
    {
      returnState.showLoader = false
    }
    else {
      returnState.viewChangesData= state.DashboardReducer.data
    }
  }
    return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ viewChanges: viewChanges }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps) (ViewComparison);
