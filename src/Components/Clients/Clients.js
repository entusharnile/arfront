import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import {getAllClients, createFilter, getClinicsProvidersProducts, updateFilter, getAllFilters, getOneFilter, deleteFilter, saveClientFields, exportClients, exportEmptyData} from '../../Actions/Clients/clientsAction.js';
import {connect} from 'react-redux'
import { bindActionCreators } from "redux";
import { ToastContainer, toast } from "react-toastify";
import {BulkImport} from './BulkImport'
import 'bootstrap-daterangepicker/daterangepicker.css';
import Select from 'react-select';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DefinedRange, DateRangePicker } from 'react-date-range';
import { format, addDays, parse } from 'date-fns';
import { showFormattedDate, checkIfPermissionAllowed, autoScrolling } from '../../Utils/services.js';
import moment from 'moment';
import newCalenImg from '../../images/new-calender-icon.png';
import newCrossImg from '../../images/new-cross.png';
import config from '../../config';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

localStorage.removeItem('cLetterKey');
localStorage.removeItem('cTerm');
localStorage.removeItem('cFilterID');
localStorage.removeItem('cFilterName');


class Clients extends Component{
  constructor(props){
    super(props);
    const languageData      = JSON.parse(localStorage.getItem('languageData'))
    const userData          = JSON.parse(localStorage.getItem('user_listing_settings'));
    const loggedInUserData  = JSON.parse(localStorage.getItem('userData'));

    window.scrollTo(0, 0)

    let cSortBy     = localStorage.getItem('cSortBy') ? localStorage.getItem('cSortBy') : null;
    let cSortOrder  = localStorage.getItem('cSortOrder') ? localStorage.getItem('cSortOrder') : null;
    let cLetterKey  = localStorage.getItem('cLetterKey') ? localStorage.getItem('cLetterKey') : null;
    let cTerm       = localStorage.getItem('cTerm') ? localStorage.getItem('cTerm') : null;
    let cFilterID   = localStorage.getItem('cFilterID') ? localStorage.getItem('cFilterID') : null;
    let cFilterName = localStorage.getItem('cFilterName') ? localStorage.getItem('cFilterName') : null;

    this.state={
      dateRangePicker: {
        selection: {
          startDate: new Date(),
          endDate: new Date(),
          key: 'selection',
        },
      },
      to_date         : '',
      from_date       : '',
      showCalendar    : false,

      clientList:[],
      cppList:[],
      getFilters:[],
      page: 1,
      pagesize: 20,
      sortby   : (cSortBy) ? cSortBy : '',
      sortorder: (cSortOrder) ? cSortOrder : 'desc',
      term: (cTerm) ? cTerm : "",
      hasMoreItems: true,
      next_page_url: '',
      loadMore: true,
      startFresh: true,
      showLoader: false,

      userChanged:false,
      firstname :'',
      lastname:'',
      email:false,
      phoneNumber:false,
      letter_key:(cLetterKey) ? cLetterKey : '',
      user_image:false,
      phoneNumber_2:false,
      gender:false,
      date_of_birth:false,
      address_line_1:false,
      address_line_2:false,
      city:false,
      state:false,
      zipcode:false,
      country:false,
      last_visit:false,
      is_fired:false,
      nick_name:false,
      showFilterModal: false,
      showModal2: false,
      showModalDelete:false,
      filter_name:'',
      editFilterFlag : false,
      tags: [
                { id: '', text: '' },

             ],
            suggestions: [
                { id: '', text: '' },

             ],
      defaultOptions: [],
      selectedOption: null,
      selectedClinics : [],
      selectedProducts: [],
      selectedProvider:[],
      filterId:'',
      member_type:'',
      fired_patient:'',
      globalLang: languageData.global,
      totalClients: 0,
      showDeleteLoading: true,
      filterToApply: (cFilterID) ? cFilterID : '',
      filterData : [],
      userData: userData,
      tabClicked: false,
      showLoadingText: false,
      reportType: '',
      expType: 'csv',
      expoType: 'xls',
      showLoadingTextLoader: false,
      appliedFilterName: (cFilterName) ? cFilterName : '',
      loggedInUserData:loggedInUserData,
      recentlyViewedClass: "search-popup no-display",
      clicked:0,
      languageData: languageData.clients,
      contextAttributes: {className: 'table-updated-tr'}
    }

    this.props.exportEmptyData({});

    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);

    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.next_page_url != null) {
        this.loadMore();
      }
    };
  }

  handleSelect=(ranges) => {
  		// {
  		// 	selection: {
  		// 		startDate: [native Date Object],
  		// 		endDate: [native Date Object],
  		// 	}
  		// }
  	}

  handleDelete = (i) => {
    const { tags } = this.state;
    this.setState({
     tags: tags.filter((tag, index) => index !== i),
    });
}

handleAddition =(tag) => {
    this.setState(state => ({ tags: [...state.tags, tag] }));
}

handleDrag =(tag, currPos, newPos) => {
    const tags = [...this.state.tags];
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags: newTags });
}

  loadMore = () => {
    if(!autoScrolling()){
    localStorage.setItem("sortOnly", false);
    this.setState({
      loadMore: true,
      startFresh: true,
      showLoadingText: true ,
      letter_key:this.state.letter_key,
      term:this.state.term,
      filter_id: this.state.filterToApply
    });
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortby: this.state.sortby,
        sortorder: this.state.sortorder,
				term: this.state.term,
        letter_key:this.state.letter_key,
        filter_id: this.state.filterToApply
      }
    };
    if ( !this.state.sortby ) {
      delete formData.params.sortby
    }
    autoScrolling(true)
    this.props.getAllClients(formData);
  }
  };

componentDidMount(){
  toast.dismiss();
  document.addEventListener('click', this.handleViewClick, false);

  this.state.userData.map((obj, id) => {
    if (obj === 'user_image') {
      this.state.user_image = true;
    }
    if (obj === 'email') {
      this.state.email = true;
    }
    if (obj === 'phoneNumber') {
      this.state.phoneNumber = true;
    }
    if (obj === 'phoneNumber_2') {
      this.state.phoneNumber_2 = true;
    }
    if (obj === 'gender') {
      this.state.gender = true;
    }
    if (obj === 'date_of_birth') {
      this.state.date_of_birth = true;
    }
    if (obj === 'address_line_1') {
      this.state.address_line_1 = true;
    }
    if (obj === 'address_line_2') {
      this.state.address_line_2 = true;
    }
    if (obj === 'city') {
      this.state.city = true;
    }
    if (obj === 'state') {
      this.state.state = true;
    }
    if (obj === 'zipcode') {
      this.state.zipcode = true;
    }
    if (obj === 'country') {
      this.state.country = true;
    }
    if (obj === 'last_visit') {
      this.state.last_visit = true;
    }
    if (obj === 'is_fired') {
      this.state.is_fired = true;
    }
    if (obj === 'nick_name') {
      this.state.nick_name = true;
    }
    if (obj === 'member_type') {
      this.state.member_type = true;
    }
  })

  let formData = {
    'params': {
      page: 1,
      pagesize: this.state.pagesize,
      sortby: this.state.sortby,
      sortorder: this.state.sortorder,
      term: this.state.term,
      letter_key:this.state.letter_key,
      filter_id: this.state.filterToApply
    }
  }

  if ( !this.state.sortby ) {
    delete formData.params.sortby
  }

  const languageData = JSON.parse(localStorage.getItem('languageData'));
  this.setState({
    client_header: languageData.clients['client_header'],
    client_merge_button: languageData.clients['client_merge_button'],
    client_recent_view_clients:languageData.clients['client_recent_view_clients'],
    client_no_filter:languageData.clients['client_no_filter'],
    client_filter_button:languageData.clients['client_filter_button'],
    client_reset_button:languageData.clients['client_reset_button'],
    client_import_export:languageData.clients['client_import_export'],
    client_export_csv:languageData.clients['client_export_csv'],
    client_bulk_import:languageData.clients['client_bulk_import'],
    client_export_excel:languageData.clients['client_export_excel'],
    client_create_client:languageData.clients['client_create_client'],
    client_profile_photo:languageData.clients['client_profile_photo'],
    client_export_csv:languageData.clients['client_export_csv'],
    client_bulk_import:languageData.clients['client_bulk_import'],
    client_export_excel:languageData.clients['client_export_excel'],
    client_create_client:languageData.clients['client_create_client'],
    client_profile_photo:languageData.clients['client_profile_photo'],
    client_first_name:languageData.clients['client_first_name'],
    client_last_name:languageData.clients['client_last_name'],
    client_email:languageData.clients['client_email'],
    client_phone_number:languageData.clients['client_phone_number'],
    client_phone2:languageData.clients['client_phone2'],
    client_gender:languageData.clients['client_gender'],
    client_address1:languageData.clients['client_address1'],
    client_address2:languageData.clients['client_address2'],
    client_fired:languageData.clients['client_fired'],
    client_city:languageData.clients['client_city'],
    client_state:languageData.clients['client_state'],
    client_zip:languageData.clients['client_zip'],
    client_country:languageData.clients['client_country'],
    client_visits:languageData.clients['client_visits'],
    client_nick_name:languageData.clients['client_nick_name'],
    client_DOB:languageData.clients['client_DOB'],
    client_alpha_a:languageData.clients['client_alpha_a'],
    client_alpha_b:languageData.clients['client_alpha_b'],
    client_alpha_c:languageData.clients['client_alpha_c'],
    client_alpha_d:languageData.clients['client_alpha_d'],
    client_alpha_e:languageData.clients['client_alpha_e'],
    client_alpha_f:languageData.clients['client_alpha_f'],
    client_alpha_g:languageData.clients['client_alpha_g'],
    client_alpha_h:languageData.clients['client_alpha_h'],
    client_alpha_i:languageData.clients['client_alpha_i'],
    client_alpha_j:languageData.clients['client_alpha_j'],
    client_alpha_k:languageData.clients['client_alpha_k'],
    client_alpha_l:languageData.clients['client_alpha_l'],
    client_alpha_m:languageData.clients['client_alpha_m'],
    client_alpha_n:languageData.clients['client_alpha_n'],
    client_alpha_o:languageData.clients['client_alpha_o'],
    client_alpha_p:languageData.clients['client_alpha_p'],
    client_alpha_q:languageData.clients['client_alpha_q'],
    client_alpha_r:languageData.clients['client_alpha_r'],
    client_alpha_s:languageData.clients['client_alpha_s'],
    client_alpha_t:languageData.clients['client_alpha_t'],
    client_alpha_u:languageData.clients['client_alpha_u'],
    client_alpha_v:languageData.clients['client_alpha_v'],
    client_alpha_w:languageData.clients['client_alpha_w'],
    client_alpha_x:languageData.clients['client_alpha_x'],
    client_alpha_y:languageData.clients['client_alpha_y'],
    client_alpha_z:languageData.clients['client_alpha_z'],
    showLoader: true,
  })
  autoScrolling(true)
  this.props.getAllClients(formData);
  this.props.getClinicsProvidersProducts()
}

handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
        [event.target.name]: value, userChanged : true
    });
}

componentWillUnmount = () => {
  this.props.exportEmptyData({});
  document.removeEventListener('click', this.handleViewClick, false);
}

handleFilterSubmit = (event) =>{
  event.preventDefault();
  let error = false;

  this.setState({
      filter_name_Error: false,
  });

  if (typeof this.state.filter_name.trim() === undefined || this.state.filter_name.trim() === null || this.state.filter_name.trim() === '') {
    this.setState({
      filter_name_Error:true
    })
    error = true;
  } else if (error === true) {
    error = false;
  }

  var clinicVal = [];

  if ( this.state.selectedClinics !== undefined  && this.state.selectedClinics.length > 0 ) {
    clinicVal = this.state.selectedClinics.map((obj, idx) => {
      return obj.value
    })
  } else {
    //error = true
  }

  var providerVal = [];

  if ( this.state.selectedProvider !== undefined  && this.state.selectedProvider.length > 0 ) {
    providerVal = this.state.selectedProvider.map((obj, idx) => {
      return obj.value
    })
  } else {
    //error = true
  }

  var productsVal = [];

  if ( this.state.selectedProducts !== undefined  && this.state.selectedProducts.length > 0 ) {
    productsVal = this.state.selectedProducts.map((obj, idx) => {
      return obj.value
    })
  } else {
    //error = true
  }

  if ( error === false ) {
    document.body.style.overflow = "";

    let formData = {
        filter_name          : this.state.filter_name,
      	product_used         : productsVal,
      	providers            : providerVal,
      	clinics              : clinicVal,
      	member_type          : this.state.member_type,
      	fired_patient        : this.state.fired_patient,
      	patient_treated_date : (this.state.from_date) ? (this.state.from_date + '-' + this.state.to_date) : ''
    };

    let filterId = this.state.filterId

    if ( filterId ) {
      this.props.updateFilter(formData, filterId)
    } else {
      if ( productsVal.length === 0 ) {
        delete formData.product_used
      }
      if ( providerVal.length === 0 ) {
        delete formData.providers
      }
      if ( clinicVal.length === 0 ) {
        delete formData.clinics
      }
      if ( this.state.member_type === '' ) {
        delete formData.member_type
      }
      if ( this.state.fired_patient === '' || this.state.fired_patient == null ) {
        delete formData.fired_patient
      }
      if ( this.state.from_date === '' || this.state.to_date === '' ) {
        delete formData.patient_treated_date
      }

      this.props.createFilter(formData);
    }

    this.setState({
      editFilterFlag: false, showLoader: true, showFilterModal: false, page: 1,
      pagesize: this.state.pagesize,
      sortorder: 'desc',
      term: '',
      letter_key: '',
      filterData: [],
      appliedFilterName: this.state.filter_name
    })
  }
}

handleSubmit = event => {
  event.preventDefault();
  // localStorage.removeItem('cSortBy');
  // localStorage.removeItem('cSortOrder');

  let formData = {
    params: {
      page: 1,
      pagesize: this.state.pagesize,
      sortorder: (this.state.sortorder) ? this.state.sortorder : 'desc',
      term: this.state.term,
      letter_key:'',
      filter_id: this.state.filterToApply,
      sortby: this.state.sortby
    }
  };

  if ( !this.state.sortby ) {
    delete formData.params.sortby
  }

  this.setState({
    page: 1,
    pagesize: this.state.pagesize,
    sortorder: this.state.sortorder,
    term:this.state.term,
    startFresh: true,
    loadMore: true,
    startFresh: true,
    next_page_url: "",
    clientList: [],
    letter_key:'',
    filter_id: this.state.filterToApply,
    tabClicked: true,
    showLoader: true,
    recentlyViewedClass: "search-popup no-display"
  });

  localStorage.setItem('cTerm', this.state.term);
  localStorage.removeItem('cLetterKey');
  autoScrolling(true)
  this.props.getAllClients(formData);

};

static getDerivedStateFromProps(nextProps, prevState) {
  if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
      return {showLoader : false};
   }

  if (prevState.tabClicked === true && prevState.recentlyViewedClass.indexOf('no-display') > -1 ) {
    return {
      tabClicked: false,
      clientList: [],
    }
  }

  if (
    nextProps.clientList !== undefined && nextProps.clientList.data !== undefined &&
    nextProps.clientList.next_page_url !== prevState.next_page_url
  ) {
    let returnState = {};
    if (prevState.next_page_url === null) {
      localStorage.setItem("sortOnly", false);
      autoScrolling(false)
      return (returnState.next_page_url = null);
    }
    if (prevState.clientList.length === 0 && prevState.startFresh === true) {
      if (localStorage.getItem("sortOnly") === "false") {
        returnState.clientList  = nextProps.clientList.data;
        if(nextProps.clientList.next_page_url !== null){
          returnState.page = prevState.page + 1;
        } else {
          returnState.next_page_url = nextProps.clientList.next_page_url;
        }
        returnState.startFresh = false;
        returnState.showLoader = false;
        returnState.totalClients = nextProps.clientList.total;
        returnState.activeLetters = nextProps.clientList.active_letters;
        returnState.showLoadingText = false;
     } else {
       localStorage.setItem("sortOnly", false);
     }
    } else if (
      prevState.clientList !== nextProps.clientList.data &&
      prevState.clientList.length !== 0
    ) {
      returnState.clientList  = [
        ...prevState.clientList ,
        ...nextProps.clientList.data
      ];
      returnState.next_page_url = nextProps.clientList.next_page_url;
      returnState.showLoader = false;
      returnState.page = prevState.page + 1;
      returnState.showLoadingText = false;
    }
    autoScrolling(false)
    return returnState;
  } else if (
    nextProps.cppList !== undefined && nextProps.cppList.status === 200 &&
    nextProps.cppList.data !== prevState.cppList
  ) {
    return {
      cppList: nextProps.cppList.data,
      defaultProviders: nextProps.cppList.data.providers,
      defaultClinics: nextProps.cppList.data.clinics,
      defaultProducts: nextProps.cppList.data.products,
      dateRangePicker: {
        selection: {
          startDate: new Date(),
          endDate: new Date(),
          key: 'selection',
        },
      },
    };
  } else if (
    nextProps.cppList !== undefined && nextProps.cppList.status !== 200 &&
    nextProps.cppList.data !== prevState.cppList
  ) {
    return {
      cppList: nextProps.cppList.data,
      showDeleteLoading: false,
      dateRangePicker: {
        selection: {
          startDate: new Date(),
          endDate: new Date(),
          key: 'selection',
        },
      },
    };
  } else if (
      nextProps.getFilters !== undefined && nextProps.getFilters.data !== undefined && nextProps.getFilters.status === 200 &&
      nextProps.getFilters.data !== prevState.getFilters
    ) {
      return {
        getFilters: nextProps.getFilters.data,
        defaultProviders: nextProps.getFilters.data.providers,
        defaultClinics: nextProps.getFilters.data.clinics,
        defaultProducts: nextProps.getFilters.data.products,
        filter_name: '',
        selectedClinics: [],
        defaultClinics: [],
        selectedProducts: [],
        defaultProducts: [],
        selectedProvider: [],
        defaultProviders: [],
        member_type: '',
        fired_patient: '',
        //from_date: format(new Date(), 'YYYY/MM/DD'),
        //to_date: format(new Date(), 'YYYY/MM/DD'),

        showDeleteLoading : false,
        userChanged        : false
      }
    } else if (
        nextProps.getFilters !== undefined && nextProps.getFilters.data !== undefined && nextProps.getFilters.status !== 200 &&
        nextProps.getFilters.data !== prevState.getFilters
      ) {
        return {
          getFilters: nextProps.getFilters.data,
          showDeleteLoading : false
        }
    } else if(nextProps.getOneFilterData !== undefined && nextProps.getOneFilterData.data !== undefined && nextProps.getOneFilterData.data !== prevState.getOneFilterData
    ) {
      if( localStorage.getItem("showLoadingText") == "false" ) {

        let selClinicsArr = nextProps.getOneFilterData.data.clinics.split(',')
        var selectedClinics = [];

        if(prevState.cppList.clinics !== undefined && prevState.cppList.clinics.length){
          prevState.cppList.clinics.map((obj, idx) => {
            if(selClinicsArr.indexOf(obj.id.toString()) > -1) {
              selectedClinics.push({value: obj.id,  label: obj.clinic_name})
            }
          })
        }
        let selProductsArr = nextProps.getOneFilterData.data.product_used.split(',')
        var selectedProducts = [];

        if(prevState.cppList.products !== undefined &&  prevState.cppList.products.length){
          prevState.cppList.products.map((obj, idx) => {
            if(selProductsArr.indexOf(obj.id.toString()) > -1) {
              selectedProducts.push({value: obj.id,  label: obj.product_name})
            }
          })
        }
        let selProvidersArr = nextProps.getOneFilterData.data.providers.split(',')
        var selectedProvider = [];

        if(prevState.cppList.providers !== undefined &&  prevState.cppList.providers.length){
          prevState.cppList.providers.map((obj, idx) => {
            if(selProvidersArr.indexOf(obj.id.toString()) > -1) {
              selectedProvider.push({value: obj.id,  label: obj.firstname+ obj.lastname})
            }
          })
        }

        let from_date = '';//format(new Date(), 'YYYY/MM/DD');
        let to_date   = '';//format(new Date(), 'YYYY/MM/DD');
        let startDate = moment().toDate();
        let endDate   = moment().toDate();

        if ( nextProps.getOneFilterData.data.patient_treated_date !== '' ) {
          let dateArray = nextProps.getOneFilterData.data.patient_treated_date.split('-')

          if ( dateArray.length > 0 ) {
            from_date = dateArray[0]
            to_date   = dateArray[1]
            startDate = moment(from_date).toDate();
            endDate   = moment(to_date).toDate();
          }
        }

        return {
          filter_name : (prevState.userChanged) ? prevState.filter_name :  nextProps.getOneFilterData.data.filter_name,
          member_type : (prevState.userChanged) ? prevState.member_type : nextProps.getOneFilterData.data.member_type,
          fired_patient : (prevState.userChanged) ? prevState.fired_patient : nextProps.getOneFilterData.data.fired_patient,
          patient_treated_date : (prevState.userChanged) ? prevState.patient_treated_date :  nextProps.getOneFilterData.data.patient_treated_date,
          selectedClinics : (prevState.userChanged) ? prevState.selectedClinics : selectedClinics,
          selectedProducts : (prevState.userChanged) ? prevState.selectedProducts : selectedProducts,
          selectedProvider : (prevState.userChanged) ? prevState.selectedProvider : selectedProvider,
          from_date: (prevState.userChanged) ? prevState.from_date : from_date,
          to_date: (prevState.userChanged) ? prevState.to_date : to_date,
          showLoadingTextLoader: false,
          getOneFilterData: nextProps.getOneFilterData.data,
          dateRangePicker: {
            selection: {
              startDate: startDate,
              endDate: endDate,
              key: 'selection',
            },
          },
        };
      }
  } else if (nextProps.filterData !== undefined && nextProps.filterData.data !== undefined &&  nextProps.filterData.status === 201 && nextProps.filterData.data !== prevState.filterData) {
    return {
        filterData : nextProps.filterData.data,
        filterToApply: nextProps.filterData.data.id
      }
  } else if (nextProps.filterData !== undefined && nextProps.filterData.data !== undefined &&  nextProps.filterData.status === 200 && nextProps.filterData.data !== prevState.filterDat) {
    return {
        filterData : nextProps.filterData.data,
        filterToApply: nextProps.filterData.data.id
      }
  } else if ( nextProps.filterData !== undefined && (nextProps.filterData.status !== 201 || nextProps.filterData.status !== 200) && nextProps.filterData.data !== prevState.filterData ) {
    return {
      showLoader: false,
      filterData : nextProps.filterData.data,
    }
  }

  if ( nextProps.deleteFilterData !== undefined && nextProps.deleteFilterData.status === 200 && nextProps.deleteFilterData.data !== prevState.deleteFilterData ) {
     return {
       deleteFilterData   : nextProps.deleteFilterData.data,
       deleteFilterStatus : nextProps.deleteFilterData.data,
     }

   } else if ( nextProps.deleteFilterData !== undefined && nextProps.deleteFilterData.status !== 200 && nextProps.deleteFilterData.data !== prevState.deleteFilterData ) {
     return {
       deleteFilterData   : nextProps.deleteFilterData.data,
       showLoader         : false,
       deleteFilterStatus : ''
     }
   }

  if (nextProps.exportFunctionCall !== undefined && nextProps.exportFunctionCall.data !== prevState.exportFunctionCall){
    let returnState = {};
    returnState.exportFunctionCall= nextProps.exportFunctionCall.data;
    returnState.showLoader = false;
    if (nextProps.exportFunctionCall.data && nextProps.exportFunctionCall.data.file) {
      window.open(config.API_URL+"download-data/"+nextProps.exportFunctionCall.data.file, "_blank");
    }
    return returnState
  }
  return null;
}

componentDidUpdate = (prevProps, prevState) => {
  if (this.state.filterToApply !== null && this.state.filterToApply !== '' && this.state.filterToApply !== prevState.filterToApply) {

    let formData = {
      'params':{
        page:1,
        pagesize:this.state.pagesize,
        term:(this.state.term) ? this.state.term : '',
        letter_key:this.state.letter_key,
        sortorder: (this.state.sortorder) ? this.state.sortorder : 'desc',
        filter_id: this.state.filterToApply,
        sortby: this.state.sortby
      }
    }

    if ( !this.state.sortby ) {
      delete formData.params.sortby
    }

    localStorage.setItem('cFilterID', this.state.filterToApply)
    if ( this.state.filter_name ) {
      localStorage.setItem('cFilterName', this.state.filter_name)
    }

    this.setState({
      page:1,
      pagesize:this.state.pagesize,
      sortorder: (this.state.sortorder) ? this.state.sortorder : 'desc',
      loadMore: true,
      startFresh: true,
      next_page_url:'',
      clientList : [],
      cppList: [],
    });
    autoScrolling(true)
    this.props.getAllClients(formData);
    this.props.getClinicsProvidersProducts()
  }

  if ( this.state.deleteFilterData !== null && this.state.deleteFilterData !== '' && this.state.deleteFilterData !== prevState.deleteFilterData && this.state.deleteFilterStatus !== null && this.state.deleteFilterStatus !== '' ) {
    this.onReset()
  }
}

showFilterModal = () => {
   document.body.style.overflow = "hidden";
   this.setState({showFilterModal: true, filterToApply: '', showDeleteLoading: true,recentlyViewedClass: "search-popup no-display"})
   this.props.getAllFilters()
}

showAddFilterModal = () => {
   document.addEventListener('click', this.handleClick, false);
   this.setState({editFilterFlag: true, filter_name: '', from_date: '', to_date: '', member_type: '', fired_patient: '', selectedClinics : [], selectedProducts: [], selectedProvider:[], userChanged: false})
   this.props.getClinicsProvidersProducts()
}

dismissFilterModal = () => {
   document.body.style.overflow = "";
   this.setState({showFilterModal: false})
   document.removeEventListener('click', this.handleClick, false);
}

dismissAddFilterModal = () => {
   this.setState({editFilterFlag: false,showFilterModal: false,showModal2: false,showLoader:false})
}

goBack = () => {
   this.setState({editFilterFlag: false, filterId: '', filter_name: '', from_date: '', to_date: '', member_type: '', fired_patient: '', selectedClinics : [], selectedProducts: [], selectedProvider:[], userChanged: false })
}

onSort = (sortby) => {
  let sortorder = (this.state.sortorder === 'asc') ? 'desc' : 'asc';
  let formData = {'params':{
    page:1,
    pagesize:this.state.pagesize,
    sortby:sortby,
    sortorder: sortorder,
    term:this.state.term,
    letter_key:this.state.letter_key,
    filter_id: this.state.filterToApply
    }
  }

  this.setState({
    page:1,
    pagesize:this.state.pagesize,
    sortby: sortby,
    sortorder: sortorder,
    loadMore: true,
    startFresh: true,
    showLoader: true,
    next_page_url:'',
    letter_key:this.state.letter_key,
    clientList : [],
    cppList: [],
    filter_id: this.state.filterToApply,
    tabClicked: true,
    recentlyViewedClass: "search-popup no-display"
  });
  autoScrolling(true)
  this.props.getAllClients(formData);
  localStorage.setItem('cSortBy', sortby);
  localStorage.setItem('cSortOrder', sortorder)
}


onReset = () => {
  localStorage.removeItem('cSortBy');
  localStorage.removeItem('cSortOrder');
  localStorage.removeItem('cLetterKey');
  localStorage.removeItem('cTerm');
  localStorage.removeItem('cFilterID');
  localStorage.removeItem('cFilterName');

  let sortorder = (this.state.sortorder === 'asc') ? 'desc' : 'asc';
  let formData = {'params':{
      page:1,
      pagesize:this.state.pagesize,
      letter_key:'',
      term:'',
      filter_id: '',
      sortorder: 'desc'
    }
  }
  this.setState({
    page:1,
    pagesize:this.state.pagesize,
    loadMore: true,
    startFresh: true,
    showLoader: true,
    next_page_url:'',
    letter_key:'',
    clientList : [],
    cppList: [],
    term:'',
    sortorder: 'desc',
    filter_id: '',
    tabClicked: true,
    appliedFilterName: '',
    sortby: undefined,
    filterToApply: '',
    recentlyViewedClass: "search-popup no-display"
  });
  //localStorage.setItem('sortOnly', true);
  autoScrolling(true)
  this.props.getAllClients(formData);
}

shouldComponentUpdate(nextProps, nextState) {
  if (this.state.startFresh) {
    return true;
  }

  if (this.state.loadMore) {
    return true;
  }

  if (this.state.showLoader) {
    return true;
  }
  return false;
}

onSortAlpha = (letter_key) => {
  if (((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf(letter_key) > -1) || letter_key === '' ) {
    let formData = {'params':{
        page:1,
        pagesize:this.state.pagesize,
        term:'',
        letter_key:letter_key,
        sortorder: (this.state.sortorder) ? this.state.sortorder : 'desc',
        filter_id: this.state.filterToApply,
        sortby: this.state.sortby
      }
    }

    if ( !this.state.sortby ) {
      delete formData.params.sortby
    }

    this.setState({
      page:1,
      pagesize:this.state.pagesize,
      //sortby: '',
      loadMore: true,
      startFresh: true,
      showLoader: true,
      next_page_url:'',
      clientList : [],
      letter_key:letter_key,
      term:'',
      filter_id: this.state.filterToApply,
      tabClicked: true,
      recentlyViewedClass: "search-popup no-display"
    });
    localStorage.setItem('cLetterKey', letter_key);
    localStorage.removeItem('cTerm');
    autoScrolling(true)
    this.props.getAllClients(formData);
  }
}

handleClinicChange = (selectedOption) => {
  this.setState({
    selectedClinics: selectedOption,
  });
}

handleProductChange = (selectedOption) => {
  this.setState({
    selectedProducts: selectedOption,
  });
}

handleProviderChange = (selectedOption) => {
  this.setState({
    selectedProvider: selectedOption,
  });
}

editFilter = (event) => {
  event.preventDefault()
  document.addEventListener('click', this.handleClick, false);

  let filterId = event.target.dataset.filterid;

  this.setState({
    editFilterFlag: true,
    filterId:event.target.dataset.filterid,
  })

  this.showLoaderFunc();

  setTimeout(function() {
    this.props.getOneFilter(filterId)
  }.bind(this), 1000)
  this.props.getClinicsProvidersProducts()
}

showDeleteFilter =(event)=>{
  let filterId = event.target.dataset.filterid;
  this.setState({showModalDelete:true, filterDeleteId:filterId, showFilterModal:false})
}

deleteThisFilter = (event) => {
  document.body.style.overflow = "";
  this.setState({showLoader: true, showFilterModal:false, showModalDelete:false, showDeleteLoading: true})
  this.props.deleteFilter(this.state.filterDeleteId)
}

dismissModalDelete =() =>{
  this.setState({showModalDelete:false, filterDeleteId:'', showFilterModal:true})
}

getClientDetails=( id )=> {
   //localStorage.setItem('userID', id)
   return (
     <div>
       {this.props.history.push(`/clients/profile/${id}`)}
     </div>
   );
 }

 handleRangeChange = (which, payload) => {
   let startDate = payload.selection.startDate
   let endDate   = payload.selection.endDate
   startDate     = format(startDate, 'YYYY/MM/DD')
   endDate       = format(endDate, 'YYYY/MM/DD')

   let clicked   = this.state.clicked + 1;

   let localPref = localStorage.getItem('focusedRange');
   let canBypass = (localPref && localPref === 'oneClick') ? true : false;

   if (canBypass) {
     clicked = 2;
   }

   let showCalendar = true;

   if ( clicked % 2 === 0 ) {
     showCalendar = false;
   }

   this.setState({
     [which]: {
       ...this.state[which],
       ...payload,
     },
     showCalendar : showCalendar,
     from_date    : startDate,
     to_date      : endDate,
     clicked      : clicked
   });

 }

 handleClick = (e) =>  {
   if (this.node && this.node.contains(e.target) && this.state.showCalendar === true ) {
     return
   }
   this.toggleCalendar(e);
 }

 toggleCalendar = (elem) => {
   if ( this.state.showCalendar === false ) {
     if ( elem.target.id === 'resetDate' ) {
        this.setState({from_date : '', dateRangePicker: {
          selection: {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
          },
        }})
     }
     if ( elem.target.id === 'showPicker' && this.state.showCalendar === false ) {
       this.setState({showCalendar : true})
     }
     return
   }

   let showCalendar = false

   if (this.state.showCalendar === false && elem.target.id !== undefined && elem.target.id === 'showPicker' ) {
     showCalendar = true
   } else {
     showCalendar = false
   }

   this.setState({showCalendar : showCalendar})
 }

 applyThisFilter = (obj) => {
   document.body.style.overflow = "";
   let filterId    = obj.id;
   let filterName  = obj.filter_name

   localStorage.setItem('cFilterID', filterId)
   localStorage.setItem('cFilterName', filterName)

   this.setState({filterToApply:filterId,
     editFilterFlag: false, showLoader: true, showFilterModal: false, page: 1,
     pagesize: this.state.pagesize,
     sortorder:(this.state.sortorder) ? this.state.sortorder : 'desc',
     term: (this.state.term) ? this.state.term : '',
     letter_key:(this.state.letter_key) ? this.state.letter_key : '',
     appliedFilterName: filterName
   })
 }

 updatePref = (event) => {
   let isChecked    = (event.target.checked === true) ? 1 : 0;
   let fieldName    = event.target.name
   let userListing  = (this.state.userData !== undefined && this.state.userData !== null) ? this.state.userData : [];

   let formData = {
       fieldname  : fieldName,
       checked    : isChecked
   };

   this.props.saveClientFields(formData);

   if ( userListing.indexOf(fieldName) > -1 && isChecked === 0 ) {
     userListing.splice(userListing.indexOf(fieldName), 1);
   }
   if ( userListing.indexOf(fieldName) === -1 && isChecked === 1 ) {
     userListing.push(fieldName);
   }
   localStorage.setItem("user_listing_settings", JSON.stringify(userListing))
 }

createClient = () => {
  return (
    <div>
      {this.props.history.push(`/clients/create`)}
    </div>
  );
}

handleExport = ( sortby, export_type) => {
  //this.setState(value);
  let sortorder = (this.state.sortorder === 'asc') ? 'desc' : 'asc';
  let formData = {
    'params': {
      page: this.state.page,
      pagesize: this.state.pagesize,
      sortby: (this.state.sortby) ? this.state.sortby: sortby,
      sortorder: this.state.sortorder,
      export_type: export_type,
      term:this.state.term,
      letter_key:this.state.letter_key,
      filter_id: this.state.filterToApply
    }
  };
  this.setState({showLoader: true});
  this.props.exportFunction(formData);
}

showLoaderFunc = ()  => {
  this.setState({showLoadingTextLoader: true})
  localStorage.setItem("showLoadingText", true);
}

handleViewClick = (event) => {
  let recentlyViewClass   = "search-popup no-display";
  const recentlyViewed    = JSON.parse(localStorage.getItem('recentlyViewedData'));

  if ( this.recentlyDeletedRef.contains(event.target) && recentlyViewed && recentlyViewed.length > 0 ) {
    recentlyViewClass = "search-popup";
    let newArray      = [];
    newArray          = recentlyViewed;
    newArray          = newArray.reverse();

    this.setState({recentlyViewedClass: recentlyViewClass, recentlyViewedData: newArray})
  }
}

dismissRecentlyViewed = (event) => {
  event.preventDefault();
  this.setState({recentlyViewedClass: "search-popup no-display"})
}

handleContextClick = (event, data) => {
  let href = window.location.href + '/profile/' + data.id;
  window.open(href, "_blank");
}

 render(){
      const { tags, suggestions,filterId } = this.state;

      var defaultClinics = [];
      if(this.state.defaultClinics != undefined && this.state.defaultClinics.length){
        this.state.defaultClinics.map((obj, idx) => {
            defaultClinics.push({value: obj.id,  label: obj.clinic_name})
        })
      }
      var defaultProducts = [];
      if(this.state.defaultProducts != undefined && this.state.defaultProducts.length){
        this.state.defaultProducts.map((obj, idx) => {
            defaultProducts.push({value: obj.id,  label: obj.product_name})
        })
      }
      var defaultProviders = [];
      if(this.state.defaultProviders != undefined && this.state.defaultProviders.length){
        this.state.defaultProviders.map((obj, idx) => {
            let proName = obj.firstname + " " + obj.lastname
            defaultProviders.push({value: obj.id,  label: proName})
        })
      }
    return(
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <ContextMenu id="some_unique_identifier">
            <MenuItem data={{foo: 'bar'}} onClick={this.handleContextClick} attributes={this.state.contextAttributes}>
              Open link in new tab
            </MenuItem>
          </ContextMenu>
          <div className="loader-outer no-display" id="patient-loader"><img src="/images/Eclipse.gif" className="loader-img" /></div>
          <div className="client-filter">
            <div className="filter-outer">

              <div className="row">

                <div className="total-patients col-sm-4">
                  <label className="patient-count">{this.state.client_header}: <b id="customers_count">{this.state.totalClients}</b></label>
                  {/*(checkIfPermissionAllowed('add-update-patients')) && <a className="blue-btn">{this.state.client_merge_button}</a>*/}
                </div>


                <div className="col-sm-5 text-center srch-outer srch-wid-alpha">
                    <div className="navbar-form search search-drop-down relative">
                    <form onSubmit={this.handleSubmit}>

                      <div className="field-outer search-bg" ref={recentlyDeletedRef => {this.recentlyDeletedRef = recentlyDeletedRef}}>
                        <i className="fas fa-search" />

                        <input
                          className="setting-search-input search-key"
    											data-url="/clients"
    											name="term"
                          placeholder={this.state.languageData.client_search}
                          value={this.state.term}
                          onChange={this.handleInputChange}
                          autoComplete ="off"
                        />
                      </div>
                    </form>
                      <div className={this.state.recentlyViewedClass}>
                        <div className="search-header relative">{this.state.client_recent_view_clients} <div className="arrow-up" /> <a onClick={this.dismissRecentlyViewed} data-dismiss="modal" className="small-cross">×</a></div>
                        {
                          (this.state.recentlyViewedData && this.state.recentlyViewedData.length > 0) && this.state.recentlyViewedData.map((obj, idx) => {
                            if ( idx < 10 ) {
                              return (
                                <Link key={idx} className="search-result-row patient-profile" to={`/clients/profile/${obj.profile_id}`}>
                                  <div className="search-photo" style={{backgroundImage: `url(${obj.profile_pic})`}}></div>{obj.profile_name}
                                </Link>
                              )
                            }
                          })
                        }
                      </div>
                    </div>

                  <div className="filter-count">{(this.state.appliedFilterName) ? this.state.appliedFilterName:  this.state.client_no_filter}</div>

                  <button className="btn btn-default dropdown-toggle" id="get_filters" type="button" onClick={this.showFilterModal} >
                    <i className="fa fa-filter" /> {this.state.client_filter_button}
                  </button>

                  <button className="btn btn-default dropdown-toggle" onClick={this.onReset} type="button" id="reset-filters">{this.state.client_reset_button}</button>
                </div>
                <div className="col-sm-3 right-create-patient">
                  <div className="pull-right">
                    {(checkIfPermissionAllowed('export-patients') || checkIfPermissionAllowed('import-patients')) && <div className="dropdown pull-left">
                      <button className="line-btn no-margin" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{this.state.client_import_export}
                        <i className="fas fa-angle-down" />
                      </button>
                      <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                        {(checkIfPermissionAllowed('export-patients')) && <li><a href="javascript:void(0);" name="expType" onClick = {this.handleExport.bind(this, "id",  this.state.expType)}>{this.state.client_export_csv}</a></li>}
                        {(checkIfPermissionAllowed('export-patients')) && <li><a href="javascript:void(0);"  name="expoType" onClick = {this.handleExport.bind(this, 'id', this.state.expoType)} >{this.state.client_export_excel}</a></li>}
                        {(checkIfPermissionAllowed('import-patients')) && <li><Link to="/clients/bulk-import" data-title="Bulk Import">{this.state.client_bulk_import}</Link></li>}
                      </ul>
                    </div>}
                    {(checkIfPermissionAllowed('add-update-patients')) && <a className="blue-btn" onClick={this.createClient}>{this.state.client_create_client}</a>}
                  </div>
                </div>
              </div>
              <div className="dropdown add-field profile-toggler">
                <button className="dropdown-toggle" type="button" data-toggle="dropdown"> +</button>
                <ul className="dropdown-menu add-field-list">
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.user_image) ? 'checked' : false} type="checkbox" id="user_image" name="user_image" /> <label htmlFor="user_image">{this.state.client_profile_photo}</label></li>
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange} type="checkbox" id="firstname" name="firstname" defaultChecked="checked" disabled="disabled" /> <label htmlFor="firstname">{this.state.client_first_name}</label></li>
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange}  type="checkbox" id="lastname" name="lastname" defaultChecked="checked" disabled="disabled" /> <label htmlFor="lastname">{this.state.client_last_name}</label></li>
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.email) ? 'checked' : false} type="checkbox" id="email" name="email"  /> <label htmlFor="email">{this.state.client_email}</label></li>
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.phoneNumber) ? 'checked' : false} type="checkbox" name="phoneNumber"  /> <label htmlFor="phoneNumber">{this.state.client_phone_number}</label></li>
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.phoneNumber_2) ? 'checked' : false} type="checkbox" id="phoneNumber_2" name="phoneNumber_2" /> <label htmlFor="phoneNumber_2">{this.state.client_phone2}</label></li>
                    <li><input type="checkbox" onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.gender) ? 'checked' : false} id="gender" name="gender" /> <label htmlFor="gender">{this.state.client_gender}</label></li>
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.date_of_birth) ? 'checked' : false} type="checkbox" id="date_of_birth" name="date_of_birth" /> <label htmlFor="date_of_birth">{this.state.client_DOB}</label></li>
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.address_line_1) ? 'checked' : false} type="checkbox" id="address_line_1" name="address_line_1" /> <label htmlFor="address_line_1">{this.state.client_address1}</label></li>
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.address_line_2) ? 'checked' : false} type="checkbox" id="address_line_2" name="address_line_2" /> <label htmlFor="address_line_2">{this.state.client_address2}</label></li>
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.city) ? 'checked' : false} type="checkbox" id="city" name="city" /> <label htmlFor="city">{this.state.client_city}</label></li>
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.state) ? 'checked' : false} type="checkbox" id="state" name="state" /> <label htmlFor="state">{this.state.client_state}</label></li>
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.zipcode) ? 'checked' : false} type="checkbox" id="zipcode" name="zipcode" /> <label htmlFor="zipcode">{this.state.client_zip}</label></li>
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.country) ? 'checked' : false} type="checkbox" id="country" name="country" /> <label htmlFor="country">{this.state.client_country}</label></li>
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.last_visit) ? 'checked' : false} type="checkbox" id="last_visit" name="last_visit"  /> <label htmlFor="last_visit">{this.state.client_visits}</label></li>
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.is_fired) ? 'checked' : false} type="checkbox" id="is_fired" name="is_fired"  /> <label htmlFor="is_fired">{this.state.client_fired}</label></li>
                    <li><input onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.nick_name) ? 'checked' : false} type="checkbox" id="nick_name" name="nick_name"  /> <label htmlFor="nick_name">{this.state.client_nick_name}</label></li>
                    {config.JUVLY_ACC_ID == this.state.loggedInUserData.user.account_id && <li><input onClick={this.updatePref} onChange={this.handleInputChange} checked={(this.state.member_type) ? 'checked' : false} type="checkbox" id="member_type" name="member_type"  /> <label htmlFor="member_type">{this.state.languageData.client_member_type}</label></li> }
                </ul>
              </div>
              {

              }
              <ul className="patient-alpha profile-toggler">{/* Usable Classes //alpha-disable//alpha-select */}
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('')}  className={(this.state.letter_key === '') ? 'letter caps-all alpha-select' : 'letter caps-all'}>{this.state.languageData.client_all}</a></li>

                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('a')}  className={(this.state.letter_key === 'a') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('a') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_a}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('b')} className={(this.state.letter_key === 'b') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('b') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_b}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('c')} className={(this.state.letter_key === 'c') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('c') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_c}</a></li>

                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('d')}  className={(this.state.letter_key === 'd') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('d') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_d}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('e')} className={(this.state.letter_key === 'e') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('e') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_e}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('f')} className={(this.state.letter_key === 'f') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('f') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_f}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('g')} className={(this.state.letter_key === 'g') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('g') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_g}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('h')} className={(this.state.letter_key === 'h') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('h') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_h}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('i')} className={(this.state.letter_key === 'i') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('i') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_i}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('j')} className={(this.state.letter_key === 'j') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('j') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_j}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('k')} className={(this.state.letter_key === 'k') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('k') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_k}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('l')} className={(this.state.letter_key === 'l') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('l') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_l}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('m')} className={(this.state.letter_key === 'm') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('m') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_m}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('n')} className={(this.state.letter_key === 'n') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('n') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_n}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('o')} className={(this.state.letter_key === 'o') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('o') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_o}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('p')} className={(this.state.letter_key === 'p') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('p') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_p}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('q')} className={(this.state.letter_key === 'q') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('q') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_q}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('r')} className={(this.state.letter_key === 'r') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('r') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_r}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('s')} className={(this.state.letter_key === 's') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('s') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_s}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('t')} className={(this.state.letter_key === 't') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('t') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_t}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('u')} className={(this.state.letter_key === 'u') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('u') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_u}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('v')} className={(this.state.letter_key === 'v') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('v') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_v}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('w')} className={(this.state.letter_key === 'w') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('w') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_w}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('x')} className={(this.state.letter_key === 'x') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('x') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_x}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('y')} className={(this.state.letter_key === 'y') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('y') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_y}</a></li>
                <li><a href="javascript:void(0);" onClick={() => this.onSortAlpha('z')} className={(this.state.letter_key === 'z') ? 'letter alpha-select' : ((this.state.activeLetters !== undefined) && Object.values(this.state.activeLetters).indexOf('z') > -1 ) ? 'letter' : 'letter alpha-disable'}>{this.state.client_alpha_z}</a></li>
              </ul>
              <table className="table-updated juvly-table desktop-patient-head clients-table profile-toggler">
                <thead className="table-updated-thead desktop-patient-head">
                  <tr>
                    <th className={(this.state.user_image) ? "table-updated-th  user_image " : "table-updated-th user_image no-display"}> {this.state.client_profile_photo}</th>
                  <th
                    className="table-updated-th sorting sortData"
                    onClick={() => this.onSort('firstname')}
                    data-url="/clients"
                    data-sort="firstname"
                    data-order="DESC"
                  >{this.state.client_first_name} <i className={(this.state.sortorder === 'asc' && this.state.sortby === 'firstname') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'firstname') ? "gray-blue" : "gray-gray" } /></th>
                    <th className="table-updated-th sorting sortData"
                    onClick={() => this.onSort('lastname')}
                    data-url="/clients"
                    data-sort="lastname"
                    data-order="DESC"
                    >{this.state.client_last_name} <i className={(this.state.sortorder === 'asc' && this.state.sortby === 'lastname') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'lastname') ? "gray-blue" : "gray-gray"}  /></th>
                    <th className={(this.state.email) ? "table-updated-th sorting email" : "table-updated-th sorting email no-display"}
                    onClick={() => this.onSort('email')}
                    data-url="/clients"
                    data-sort="email"
                    data-order="DESC"
                    >{this.state.client_email} <i className={(this.state.sortorder === 'asc' && this.state.sortby === 'email') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'email') ? "gray-blue" : "gray-gray"}  /></th>

                    <th className={(this.state.phoneNumber) ? "table-updated-th  phoneNumber " : "table-updated-th phoneNumber no-display"}>{this.state.client_phone_number}</th>
                    <th className={(this.state.phoneNumber_2) ? "table-updated-th  phoneNumber_2 " : "table-updated-th phoneNumber_2 no-display"}>{this.state.client_phone2}</th>
                    <th className={(this.state.gender) ? "table-updated-th  gender " : "table-updated-th gender no-display"}>{this.state.client_gender}</th>

                    <th className={(this.state.date_of_birth) ? "table-updated-th  date_of_birth sorting" : "table-updated-th date_of_birth no-display"} onClick={() => this.onSort('date_of_birth')} data-url="/clients" data-sort="date_of_birth"            data-order="DESC">{this.state.client_DOB} <i className={(this.state.sortorder === 'asc' && this.state.sortby === 'date_of_birth') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'date_of_birth') ? "gray-blue" : "gray-gray" } /></th>

                    <th className={(this.state.address_line_1) ? "table-updated-th  address_line_1 " : "table-updated-th address_line_1 no-display"}>{this.state.client_address1}</th>
                    <th className={(this.state.address_line_2) ? "table-updated-th  address_line_2 " : "table-updated-th address_line_2 no-display"}> {this.state.client_address2}</th>

                    <th className={(this.state.city) ? "table-updated-th  city " : "table-updated-th city no-display"}>{this.state.client_city}</th>
                    <th className={(this.state.state) ? "table-updated-th  state " : "table-updated-th state no-display"}>{this.state.client_state}</th>
                    <th className={(this.state.zipcode) ? "table-updated-th  zipcode " : "table-updated-th zipcode no-display"}>{this.state.client_zip}</th>
                    <th className={(this.state.country) ? "table-updated-th  country " : "table-updated-th country no-display"}> {this.state.client_country}</th>
                    <th className={(this.state.last_visit) ? "table-updated-th  last_visit " : "table-updated-th last_visit no-display"}>{this.state.client_visits}</th>
                    <th className={(this.state.is_fired) ? "table-updated-th  is_fired " : "table-updated-th is_fired no-display"}>{this.state.client_fired}</th>
                    <th className={(this.state.nick_name) ? "table-updated-th  nick_name " : "table-updated-th nick_name no-display"}>{this.state.client_nick_name}</th>
                    {config.JUVLY_ACC_ID == this.state.loggedInUserData.user.account_id && <th className={(this.state.member_type) ? "table-updated-th  member_type " : "table-updated-th member_type no-display"}>{this.state.languageData.client_member_type}</th>}
                  </tr>
                </thead>
              </table>
            </div>

          </div>
          <div className="table-responsive patient-responsive clients-table profile-toggler">
            <table className="table-updated juvly-table min-w-1000">
              <thead className="table-updated-thead mobile-patient-head">
              <tr>
                <th className={(this.state.user_image) ? "table-updated-th  user_image " : "table-updated-th user_image no-display"}> {this.state.client_profile_photo}</th>
              <th
                className="table-updated-th sorting sortData"
                onClick={() => this.onSort('firstname')}
                data-url="/clients"
                data-sort="firstname"
                data-order="DESC"
              >{this.state.client_first_name} <i className={(this.state.sortorder === 'asc' && this.state.sortby === 'firstname') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'firstname') ? "gray-blue" : "gray-gray" } /></th>
                <th className="table-updated-th sorting sortData"
                onClick={() => this.onSort('lastname')}
                data-url="/clients"
                data-sort="lastname"
                data-order="DESC"
                >{this.state.client_last_name} <i className={(this.state.sortorder === 'asc' && this.state.sortby === 'lastname') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'lastname') ? "gray-blue" : "gray-gray" } /></th>
                <th className={(this.state.email) ? "table-updated-th sorting email" : "table-updated-th sorting email no-display"}
                onClick={() => this.onSort('email')}
                data-url="/clients"
                data-sort="email"
                data-order="DESC"
                >{this.state.client_email} <i className={(this.state.sortorder === 'asc' && this.state.sortby === 'email') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'email') ? "gray-blue" : "gray-gray" } /></th>

                <th className={(this.state.phoneNumber) ? "table-updated-th  phoneNumber " : "table-updated-th phoneNumber no-display"}>{this.state.client_phone_number}</th>
                <th className={(this.state.phoneNumber_2) ? "table-updated-th  phoneNumber_2 " : "table-updated-th phoneNumber_2 no-display"}>{this.state.client_phone2}</th>
                <th className={(this.state.gender) ? "table-updated-th  gender " : "table-updated-th gender no-display"}>{this.state.client_gender}</th>
                <th className={(this.state.date_of_birth) ? "table-updated-th  date_of_birth sorting" : "table-updated-th date_of_birth no-display"} onClick={() => this.onSort('date_of_birth')} data-url="/clients" data-sort="date_of_birth"            data-order="DESC">{this.state.client_DOB} <i className={(this.state.sortorder === 'asc' && this.state.sortby === 'date_of_birth') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'date_of_birth') ? "gray-blue" : "gray-gray" } /></th>
                <th className={(this.state.address_line_1) ? "table-updated-th  address_line_1 " : "table-updated-th address_line_1 no-display"}>{this.state.client_address1}</th>
                <th className={(this.state.address_line_2) ? "table-updated-th  address_line_2 " : "table-updated-th address_line_2 no-display"}> {this.state.client_address2}</th>

                <th className={(this.state.city) ? "table-updated-th  city " : "table-updated-th city no-display"}>{this.state.client_city}</th>
                <th className={(this.state.state) ? "table-updated-th  state " : "table-updated-th state no-display"}>{this.state.client_state}</th>
                <th className={(this.state.zipcode) ? "table-updated-th  zipcode " : "table-updated-th zipcode no-display"}>{this.state.client_zip}</th>
                <th className={(this.state.country) ? "table-updated-th  country " : "table-updated-th country no-display"}> {this.state.client_country}</th>
                <th className={(this.state.last_visit) ? "table-updated-th  last_visit " : "table-updated-th last_visit no-display"}>{this.state.client_visits}</th>
                <th className={(this.state.is_fired) ? "table-updated-th  is_fired " : "table-updated-th is_fired no-display"}>{this.state.client_fired}</th>
                <th className={(this.state.nick_name) ? "table-updated-th  nick_name " : "table-updated-th nick_name no-display"}>{this.state.client_nick_name}</th>
                {config.JUVLY_ACC_ID == this.state.loggedInUserData.user.account_id && <th className={(this.state.member_type) ? "table-updated-th  member_type " : "table-updated-th member_type no-display"}>{this.state.languageData.client_member_type}</th>}
              </tr>
              </thead>
              <tbody className="ajax_body">

              {this.state.clientList !== undefined &&
                this.state.clientList.map((obj, idx) => {

                  let memberImg    = '';

                  if ( obj && obj.is_monthly_membership === 1 ) {
                    memberImg = '../../../images/member.png'
                  }

                  if ( obj && obj.is_monthly_membership === 0 && obj.membership_cancelled_reason === 'payment_failed' ) {
                    memberImg = '../../../images/non-member.png'
                  }

                  let fired = ''

                  if ( obj.is_fired == 1 ) {
            				fired = 'Yes'
            			} else {
            				fired = 'No'
            			}

                  let gender = ''

                  if ( obj.gender === "1" ) {
                      gender = 'Female'
                  } else if ( obj.gender === "0" ) {
                      gender = 'Male'
                  }  else if ( obj.gender == "2" ) {
                      gender = 'Not disclosed'
                  } else {
      			          gender = 'Not disclosed'
                  }

                  let memberType = "None";

                  if ( obj.member_type ) {
                    memberType = obj.member_type;

                    if ( memberType === 'juvly_member' ) {
                      memberType = "Member";
                    } else if ( memberType === 'model' ) {
                      memberType = "Model";
                    } else if ( memberType === 'both' ) {
                      memberType = "Both";
                    } else {
                      memberType = "None";
                    }
                  }

                  return (
                <ContextMenuTrigger collect={() => {return obj}} attributes={this.state.contextAttributes} renderTag="tr" id={`some_unique_identifier`} key={idx}>
                  {(obj.user_image !== '' && obj.user_image_url !== '') ? <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.user_image) ? "table-updated-td " : "table-updated-td no-display"}><span className="td-user_image"><img src={obj.user_image_url} alt="client" width="40px" height="40px"/><br /></span></td> : <td className={(this.state.user_image) ? "table-updated-td " : "table-updated-td no-display"} onClick={this.getClientDetails.bind(this, obj.id)}><span className="user-profile-img"><br /></span></td>}

                  <td onClick={this.getClientDetails.bind(this, obj.id)} className="table-updated-td break-all"><span className="td-clinic-name">{(obj && memberImg ) && <img style={{width: '20px'}} src={memberImg} />} {obj.firstname}</span></td>
                  <td onClick={this.getClientDetails.bind(this, obj.id)} className="table-updated-td break-all"><span >{obj.lastname}</span></td>
                  <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.email) ? "table-updated-td break-all" : "table-updated-td no-display"}>{obj.email}</td>
                  <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.phoneNumber) ? "table-updated-td break-all" : "table-updated-td no-display"}><span >{obj.phoneNumber}<br /></span></td>
                  <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.phoneNumber_2) ? "table-updated-td break-all" : "table-updated-td no-display"}><span >{obj.phoneNumber_2}<br /></span></td>
                  <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.gender) ? "table-updated-td keep-all" : "table-updated-td no-display"}><span >{gender}<br /></span></td>
                  <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.date_of_birth) ? "table-updated-td " : "table-updated-td no-display"}><span >{(obj.date_of_birth) ? showFormattedDate(obj.date_of_birth) : ''}<br /></span></td>

                  <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.address_line_1) ? "table-updated-td " : "table-updated-td no-display"}><span >{obj.address_line_1}<br /></span></td>
                  <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.address_line_2) ? "table-updated-td " : "table-updated-td no-display"}><span >{obj.address_line_2}<br /></span></td>
                  <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.city) ? "table-updated-td " : "table-updated-td no-display"}><span >{obj.city}<br /></span></td>
                  <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.state) ? "table-updated-td " : "table-updated-td no-display"}><span >{obj.state}<br /></span></td>
                  <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.zipcode) ? "table-updated-td " : "table-updated-td no-display"}><span >{obj.pincode}<br /></span></td>
                  <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.country) ? "table-updated-td " : "table-updated-td no-display"}><span >{obj.country}<br /></span></td>
                  <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.last_visit) ? "table-updated-td " : "table-updated-td no-display"}><span >{(obj.last_appointment.length > 0) ? showFormattedDate(obj.last_appointment[0].appointment_datetime) : "Never"}<br /></span></td>
                  <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.is_fired) ? "table-updated-td " : "table-updated-td no-display"}><span >{fired}<br /></span></td>
                  <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.nick_name) ? "table-updated-td " : "table-updated-td no-display"}><span >{obj.nick_name}<br /></span></td>
                  {config.JUVLY_ACC_ID == this.state.loggedInUserData.user.account_id && <td onClick={this.getClientDetails.bind(this, obj.id)} className={(this.state.member_type) ? "table-updated-td " : "table-updated-td no-display"}><span >{memberType}<br /></span></td>}
                </ContextMenuTrigger>
)})}

              </tbody>
            </table>
            <div className={(this.state.clientList.length || this.state.showLoader === true) ? "no-record no-display" : "no-record client-norecord"}>Sorry, No record found</div>
          </div>
        </div>

        <div className={(this.state.showModalDelete ? 'overlay' : '')}></div>
          <div id="filterModal" role="dialog" className={(this.state.showModalDelete ? 'modal fade in displayBlock' : 'modal fade')}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModalDelete}>×</button>
                  <h4 className="modal-title" id="model_title">{this.state.languageData.client_conf_required}{this.state.showModalDelete}</h4>
                </div>
                <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                  {this.state.languageData.client_conf_delete_filter}
                </div>
                <div className="modal-footer" >
                  <div className="col-md-12 text-left" id="footer-btn">

                    <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModalDelete}>{this.state.languageData.client_no}</button>
                    <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" data-filterid={this.state.filterDeleteId} onClick={this.deleteThisFilter.bind(this)}>{this.state.languageData.client_yes}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={(this.state.showFilterModal ? 'overlay' : '')}></div>
              <div id="filterModal" role="dialog" className={(this.state.showFilterModal ? 'modal fade in displayBlock' : 'modal fade')}>
                <div className="">
                  <div className="modal-content">
                    {/*<div className="modal-header">
                      // <button type="button" className="close" data-dismiss="modal" onClick={this.dismissFilterModal}>×</button>
                      <h4 className="modal-title" id="model_title">{this.state.showFilterModal}</h4>
                    </div>*/}

                    <div>
                      <div className={!this.state.editFilterFlag ? 'modalOverlay allFilters' : 'no-display'}>
                              <div className="small-popup-outer client-filter-popup">
                              <h4 className="modal-title" id="model_title">{this.state.showFilterModal}</h4>

                                <div className="small-popup-header">
                                  <div className="popup-name">{this.state.languageData.client_filter}</div>
                                  <a data-dismiss="modal" onClick={this.dismissFilterModal} className="small-cross">×</a>
                                </div>
                                <div className="filter-title">
                                  <span className="juvly-subtitle">{this.state.languageData.client_saved_filter}</span>
                                  <a onClick={this.showAddFilterModal} className="new-blue-btn pull-right">{this.state.languageData.client_new_filter}</a>
                                </div>
                                <div className="small-popup-content saved-filter-content">
                                  <table className="table-updated juvly-table filter-table">
                                    <tbody>
                                    {this.state.getFilters !== undefined && this.state.getFilters && this.state.getFilters.length > 0 ?
                                      this.state.getFilters.map((obj, idx) => {
                                        return (
                                          <tr key={idx} className={(this.state.showDeleteLoading === true) ? "table-updated-tr no-display" : "table-updated-tr" }>
                                            <td className="table-updated-td Questionnaire-name col-sm-7 col-xs-6"><i className="fas fa-filter" />{obj.filter_name}</td>
                                            <td className="table-updated-td no-border-left text-right col-sm-5 col-xs-6">
                                              <a className="easy-link" data-filterid={obj.id} onClick={() => this.applyThisFilter(obj)}>{this.state.languageData.client_apply}</a>
                                              <a className="easy-link" data-filterid={obj.id} onClick={this.editFilter}>{this.state.languageData.client_edit}</a>
                                              <a className="easy-link" data-filterid={obj.id} onClick={this.showDeleteFilter}>{this.state.languageData.client_delete}</a>
                                            </td>
                                          </tr>
                                    )
                                  }) :  <tr className={(this.state.showDeleteLoading === true && this.state.getFilters !== undefined && this.state.getFilters && this.state.getFilters.length > 0) ? "table-updated-tr no-display" : "table-updated-tr"}><td colSpan="2" className="table-updated-td Questionnaire-name col-sm-7 col-xs-6 text-center">{(this.state.showDeleteLoading) ? this.state.languageData.client_loading_dot : this.state.languageData.client_no_record_found}</td></tr>}

                                    <tr className={(this.state.showDeleteLoading === true && this.state.getFilters !== undefined && this.state.getFilters && this.state.getFilters.length > 0) ? "table-updated-tr" : "table-updated-tr no-display"}><td colSpan="2" className="table-updated-td Questionnaire-name col-sm-7 col-xs-6 text-center">{this.state.languageData.client_loading_dot}</td></tr>

                                    </tbody>
                                  </table>
                                </div>
                                <div className="small-popup-footer">
                                </div>
                              </div>
                      </div>
                      <div className={this.state.editFilterFlag ? 'modalOverlay createEditFilter' : 'no-display'}>
                        <div className="small-popup-outer client-filter-popup">
                          <div className="small-popup-header">
                          <h4 className="modal-title" id="model_title">{this.state.showModal2}</h4>
                            <button onClick={this.goBack} className="go-back" ><i className="fas fa-angle-left" /></button>
                            <div className="popup-name">{this.state.languageData.client_filter}</div>

                          </div>

                          {(this.state.showLoadingTextLoader === false) && <div className="small-popup-content">
                            <div className="juvly-container no-padding-bottom">
                              <div className="row">

                                <div className="col-sm-6 col-xs-12">
                                  <div className="setting-field-outer">
                                    <div className="new-field-label">{this.state.languageData.client_filter_name}</div>
                                    <div className="setting-input-outer">
                                    <input onChange={this.handleInputChange} className={this.state.filter_name_Error === true ? "setting-input-box field_error" : "setting-input-box"} value={this.state.filter_name} type="text" name="filter_name" autoComplete="off" />
                                    </div>
                                  </div>

                                </div>
                                <div className="col-sm-6 col-xs-12">
                                  <div className="setting-field-outer">
                                    <div className="new-field-label">{this.state.languageData.client_treated}</div>
                                    <div className="setting-input-outer" ref={node => {this.node = node}}>

                                    <input onChange={this.handleInputChange} name="patient_treated_date" value={(this.state.from_date) ? showFormattedDate(this.state.from_date) + `-` + showFormattedDate(this.state.to_date) : ""} className="setting-input-box p-r-40" type="text" autoComplete="off" />


                                    <img id="showPicker" src={newCalenImg} className="client-treat-cal"/>

                                    <img id="resetDate" src={newCrossImg} className="client-treat-reset" />

                                    {this.state.showCalendar && <DateRangePicker
                                      ranges={[this.state.dateRangePicker.selection]}
                                      onChange={this.handleRangeChange.bind(this, 'dateRangePicker')}
                                      className={'CalendarPreviewArea'}
                                      maxDate={new Date()}
                                      dragSelectionEnabled={false}
                                      /> }
                                    </div>
                                  </div>
                                </div>
                                <div className="col-xs-12">
                                  <div className="setting-field-outer">
                                    <div className="new-field-label">{this.state.languageData.client_clinics}</div>
                                    <div className="setting-input-outer search-selected">
                                    <div className="tag-auto-select">
                                    {/*<input onChange={this.handleInputChange}  className="setting-input-box" name="clinics" type="text" />*/}
                                    {
                                       defaultClinics && <Select
                                      onChange={this.handleClinicChange}
                                      name="clinics"
                                      value={this.state.selectedClinics}
                                      isClearable
                                      isSearchable
                                      options={defaultClinics}
                                      isMulti={true}
                                      placeholder={this.state.languageData.client_select_clinics}
                                    />
                                    }

                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-xs-12">
                                  <div className="setting-field-outer">
                                    <div className="new-field-label">{this.state.languageData.client_product_used}</div>
                                      <div className="setting-input-outer search-selected">
                                        <div className="tag-auto-select">
                                        {
                                           defaultProducts && <Select
                                          onChange={this.handleProductChange}
                                          name="product_used"
                                          value={this.state.selectedProducts}
                                          isClearable
                                          isSearchable
                                          options={defaultProducts}
                                          isMulti={true}
                                          placeholder={this.state.languageData.client_select_product}
                                        />
                                        }
                                    </div>

                                    {/*<input onChange={this.handleInputChange} className="setting-input-box" name="product_used" type="text" />*/}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-xs-12">
                                  <div className="setting-field-outer">
                                    <div className="new-field-label">{this.state.languageData.client_providers}</div>
                                      <div className="setting-input-outer search-selected">
                                        <div className="tag-auto-select">
                                          {/* <input onChange={this.handleInputChange} className="setting-input-box" name="providers" type="text" />*/}
                                          {
                                             defaultProviders && <Select
                                            onChange={this.handleProviderChange}
                                            name="providers"
                                            value={this.state.selectedProvider}
                                            isClearable
                                            isSearchable
                                            options={defaultProviders}
                                            isMulti={true}
                                            placeholder={this.state.languageData.client_select_providers}
                                          />
                                          }

                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {(this.state.loggedInUserData) && (this.state.loggedInUserData.user.account_id === config.JUVLY_ACC_ID || this.state.loggedInUserData.user.account_id === config.CC_ACC_ID) && <div className="col-sm-6 col-xs-12">
                                  <div className="setting-field-outer">
                                    <div className="new-field-label">{this.state.languageData.client_member_type}</div>
                                    <div className="setting-input-outer">
                                      <select value={this.state.member_type}  name="member_type" onChange={this.handleInputChange} className="setting-select-box">
                                        <option value="">Choose Type</option>
                                        <option value="model">Model</option>
                                        <option value="juvly_member">Member</option>
                                        <option value="both">Both</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>}
                                <div className="col-sm-6 col-xs-12">
                                  <div className="setting-field-outer">
                                    <div className="new-field-label">{this.state.languageData.client_fired_clients}</div>
                                    <div className="setting-input-outer">
                                      <div className="basic-checkbox-outer">
                                      <input onChange={this.handleInputChange} id="yes" className="basic-form-checkbox" checked={this.state.fired_patient === '1' || this.state.fired_patient === 1} value="1" name="fired_patient" type="radio" />

                                        <label className="basic-form-text" htmlFor="yes">{this.state.languageData.client_yes}</label>
                                      </div>
                                      <div className="basic-checkbox-outer">
                                      <input id="no" className="basic-form-checkbox" checked={this.state.fired_patient === '0' || this.state.fired_patient === 0} value="0" onChange={this.handleInputChange} name="fired_patient" type="radio" />
                                        <label className="basic-form-text" htmlFor="no">{this.state.languageData.client_no}</label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>}
                          {(this.state.showLoadingTextLoader === false) && <div className="footer-static">
                            <a className="new-blue-btn pull-right" data-dismiss="modal" onClick={this.handleFilterSubmit}>Save &amp; Apply</a>
                          </div>}
                          {
                            (this.state.showLoadingTextLoader) && <div className="text-center text-loading">{this.state.languageData.client_loading_dot}</div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock clientLoader' : 'new-loader text-left'}>
                <div className="loader-outer">
                  <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                  <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.loading_please_wait_text}</div>
                </div>
              </div>
              <div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display"}>{this.state.globalLang.loading_please_wait_text}</div>
      </div>
    );
  }
}
function mapStateToProps(state){
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState  = {};

  localStorage.setItem("showLoadingText", false);

  if (state.ClientsReducer.action === "CLIENTS_LIST") {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.clientList = state.ClientsReducer.data.data;
    }
  }
  else if (state.ClientsReducer.action === "GET_CPP_DATA") {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.cppList = state.ClientsReducer.data;
    } else {
      returnState.cppList = state.ClientsReducer.data;
    }
  }
  else if (state.ClientsReducer.action === "CREATE_FILTER") {
    if ( state.ClientsReducer.data.status !== 201 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.filterData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.filterData = state.ClientsReducer.data;
    }
  }
  else if (state.ClientsReducer.action === "UPDATE_FILTER") {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.filterData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.filterData = state.ClientsReducer.data;
    }
  }
  else if (state.ClientsReducer.action === "DELETE_FILTER") {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.deleteFilterData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.deleteFilterData = state.ClientsReducer.data;
    }
  }
  else if (state.ClientsReducer.action === "GET_ALL_FILTERS") {
    if ( state.ClientsReducer.data.status !== 200 ) {
      if ( state.ClientsReducer.data.message !== 'record_not_found' ) {
        toast.error(languageData.global[state.ClientsReducer.data.message]);
        returnState.showLoader = false
      }
      returnState.getFilters = state.ClientsReducer.data;
    } else {
      returnState.getFilters = state.ClientsReducer.data;
    }
  }
  else if (state.ClientsReducer.action === "GET_ONE_FILTER") {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.getOneFilterData = state.ClientsReducer.data;
    }
  } else if (state.ClientsReducer.action === "EXPORT_FILE") {
    if (state.ClientsReducer.data.status === 200) {
      return {
        exportFunctionCall: state.ClientsReducer.data,
        timeStamp : new Date()
      };
    }
  }

  if (state.ClientsReducer.action === 'EMPTY_DATA' ) {
    if ( state.ClientsReducer.data.status != 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      return {}
    } else {
      return {}
    }
  }

  return returnState
}

function mapDispatchToProps(dispatch){
return bindActionCreators({
  getAllClients:getAllClients,
  createFilter:createFilter,
  getClinicsProvidersProducts:getClinicsProvidersProducts,
  updateFilter:updateFilter,
  getAllFilters:getAllFilters,
  getOneFilter:getOneFilter,
  deleteFilter:deleteFilter,
  saveClientFields: saveClientFields,
  exportFunction: exportClients,
  exportEmptyData: exportEmptyData
},dispatch)
}
export default connect(mapStateToProps,mapDispatchToProps) (Clients);
