import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import Sidebar from '../../../Containers/Settings/sidebar.js';
import { ToastContainer, toast } from "react-toastify";
import { capitalizeFirstLetter } from '../../../Utils/services.js';
import { fetchDotPhrases, exportEmptyData, deleteDotPhrase } from '../../../Actions/Settings/dotPhraseActions.js';
import { autoScrolling } from "../../../Utils/services.js";



class DotPhrases extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const languageData  = JSON.parse(localStorage.getItem('languageData'))

    this.state = {
      showLoader        : false,
      globalLang        : languageData.global,
      dataChanged       : false,
      page              : 1,
      pagesize          : 15,
      searhTerm         : '',
      term              : '',
      startFresh        : true,
      phraseListData    : [],
      next_page_url     : '',
      phraseToDelete    : 0,
      showConfirmation  : false,
      settingLang       : languageData.settings,
    }

    this.props.exportEmptyData({});

    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.next_page_url != null) {
        this.loadMore();
      }
    };
  }


  handleInputChange = (event) => {
     const target = event.target;
     const value = target.type === 'checkbox' ? target.checked : target.value;

     this.setState({[event.target.name]: value , dataChanged : true});
  }

  componentDidMount() {
    this.setState({showLoader: true});

    let formData = {
      'params'   : {
        page     : this.state.page,
        pagesize : this.state.pagesize,
        term     : this.state.term
      }
    }
    autoScrolling(true);
    this.props.fetchDotPhrases(formData);
  }

  loadMore = () => {
    if(!autoScrolling()){
      let formData = {
        'params'   : {
          page     : this.state.page,
          pagesize : this.state.pagesize,
          term     : this.state.term
        }
      }

      this.setState({showLoadingText: true});
      autoScrolling(true);
      this.props.fetchDotPhrases(formData);
    }
  }

  static getDerivedStateFromProps = (props, state) => {

    if ( props.dotPhraseData !== undefined && props.dotPhraseData.status === 200 && props.dotPhraseData.data !== state.dotPhraseData && props.dotPhraseData.data.next_page_url !== state.next_page_url ) {

      let returnState = {};

      if ( state.next_page_url === null ) {
        autoScrolling(false);
        return (returnState.next_page_url = null);
      }
      if ( state.phraseListData && state.phraseListData.length === 0 && state.startFresh === true ) {
        returnState.dotPhraseData = props.dotPhraseData.data;

        if ( props.dotPhraseData.data.next_page_url !== null ) {
          returnState.page          = state.page + 1;
        } else {
          returnState.next_page_url = props.dotPhraseData.data.next_page_url;
        }
        returnState.startFresh       = false;
        returnState.showLoader       = false;
        returnState.showLoadingText  = false;
        returnState.phraseListData   = props.dotPhraseData.data.data;
      } else if ( state.dotPhraseData !== props.dotPhraseData.data && state.dotPhraseData.length !== 0 ) {
        returnState.phraseListData   = [...state.phraseListData , ...props.dotPhraseData.data.data];
        returnState.dotPhraseData    = props.dotPhraseData.data;
        returnState.next_page_url    = props.dotPhraseData.data.next_page_url;
        returnState.showLoader       = false;
        returnState.page             = state.page + 1;
        returnState.showLoadingText  = false;
      }
      autoScrolling(false);
      return returnState;
     } else if ( props.dotPhraseData !== undefined && props.dotPhraseData.status !== 200 && props.dotPhraseData.data !== state.dotPhraseData ) {
       return {
         dotPhraseData      : props.dotPhraseData.data,
         showLoader         : false,
         next_page_url      : null
       }
     }

     if ( props.deletePhraseData !== undefined && props.deletePhraseData.status === 200 && props.deletePhraseData.data !== state.deletePhraseData ) {
        return {
          deletePhraseData   : props.deletePhraseData.data,
          showLoader         : false,
          phraseToDelete     : 0,
          deleteStatus       : props.deletePhraseData.data
        }

      } else if ( props.deletePhraseData !== undefined && props.deletePhraseData.status !== 200 && props.deletePhraseData.data !== state.deletePhraseData ) {
        return {
          deletePhraseData   : props.deletePhraseData.data,
          showLoader         : false,
          deleteStatus       : ''
        }
      }
     return null
  }

  componentWillUnmount() {
    this.props.exportEmptyData({});
  }

  handleSubmit = event => {
    event.preventDefault();

    let formData = {
      'params'   : {
        page     : 1,
        pagesize : this.state.pagesize,
        term     : this.state.term
      }
    }

    this.setState({showLoader: true, startFresh: true, next_page_url: "", phraseListData: [], page: 1});
    autoScrolling(true);
    this.props.fetchDotPhrases(formData);
  }

  showConfirmation = (id) => {
    this.setState({phraseToDelete: id, showConfirmation: true})
  }

  dismissConfirmation = () => {
    this.setState({phraseToDelete: 0, showConfirmation: false})
  }

  deleteThisPhrase = () => {
    this.setState({showConfirmation: false, showLoader: true})
    this.props.deleteDotPhrase(this.state.phraseToDelete);
  }

  componentDidUpdate = (prevProps, prevState) => {
    if ( this.state.deletePhraseData !== null && this.state.deletePhraseData !== '' && this.state.deletePhraseData !== prevState.deletePhraseData && this.state.deleteStatus !== null && this.state.deleteStatus !== '' ) {
      this.setState({showLoader: true, startFresh: true, next_page_url: "", phraseListData: [], page: 1})
      let formData = {
        'params'   : {
          page     : 1,
          pagesize : this.state.pagesize,
          term     : this.state.term
        }
      }
      autoScrolling(true);
      this.props.fetchDotPhrases(formData);
    }
  }

  addDotPhrase = () => {
    return (
      <div>
        {this.props.history.push(`/settings/dot-phrases/create`)}
      </div>
    );
  }

  updateDotPhrase = (id) => {
    return (
      <div>
        {this.props.history.push(`/settings/dot-phrases/edit/${id}`)}
      </div>
    );
  }

  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <Sidebar />
             <div className="setting-setion">
               <div className="setting-search-outer">
                 <form onSubmit={this.handleSubmit}>
                   <div className="search-bg new-search">
                     <i className="fas fa-search"></i>
                     <input className="setting-search-input search-key" name="term" placeholder="Search" autoComplete="off" value={this.state.term} onChange={this.handleInputChange} />
                   </div>
                 </form>
                 <a className="new-blue-btn pull-right" onClick={() => this.addDotPhrase()}>Add</a>
               </div>
               <div className="table-responsive">
                 <table className="table-updated juvly-table table-min-width">
                   <thead className="table-updated-thead">
                     <tr>
                       <th className="col-xs-2 table-updated-th">Dot(.) Phrase</th>
                       <th className="col-xs-2 table-updated-th">Title</th>
                       <th className="col-xs-2 table-updated-th">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="ajax_body" >

                   {this.state.dotPhraseData && this.state.phraseListData && this.state.phraseListData.length > 0 && this.state.phraseListData.map((obj, idx) => {

                       return(
                         <tr key={idx} className="table-updated-tr">
                           <td className="table-updated-td">{(obj.name) ? capitalizeFirstLetter(obj.name) : ''}</td>
                           <td className="table-updated-td">{(obj.title) ? obj.title : ''}</td>
                           <td className="table-updated-td">
                           <a className="m-r-10 edit_setting easy-link" onClick={() => this.updateDotPhrase(obj.id)}>Edit</a>
                           <a className="confirm-model easy-link" onClick={() => this.showConfirmation(obj.id)}>Delete</a>
                           </td>
                         </tr>
                       )
                     })
                   }
                  </tbody>
                 </table>
                 {(this.state.showLoader === false) && <div className={this.state.dotPhraseData && this.state.phraseListData && this.state.phraseListData.length > 0 ? "no-record no-display" : "no-record"}>Sorry, No Record Found</div>}
               </div>

               <div className={(this.state.showConfirmation === true ) ? 'overlay' : ''}></div>
               <div role="dialog" className={(this.state.showConfirmation === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
                 <div className="modal-dialog">
                   <div className="modal-content">
                     <div className="modal-header">
                       <button type="button" className="close" data-dismiss="modal" onClick={this.dismissConfirmation}>×</button>
                       <h4 className="modal-title">{this.state.settingLang.settings_Confirmation_required}</h4>
                     </div>
                     <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                     Are you sure you want to delete this dot phrase?
                     </div>
                     <div className="modal-footer" >
                       <div className="col-md-12 text-left">
                         <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissConfirmation}>{this.state.settingLang.no_option}</button>
                         <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteThisPhrase}>{this.state.settingLang.yes_option}</button>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                 <div className="loader-outer">
                   <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                   <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.loading_please_wait_text}</div>
                 </div>
               </div>
               <div className={(this.state.showLoadingText) ? "loading-please-wait no-margin-top" : "loading-please-wait no-margin-top no-display"}>{this.state.globalLang.loading_please_wait_text}</div>
             </div>
         </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const languageData  = JSON.parse(localStorage.getItem("languageData"))
  const returnState   = {}

  if ( state.DotPhraseReducer.action === "GET_PHRASE_DATA" ) {
    if ( state.DotPhraseReducer.data.status !== 200 ) {
      //toast.error(languageData.global[state.DotPhraseReducer.data.message]);
      returnState.dotPhraseData = state.DotPhraseReducer.data;
    } else {
      returnState.dotPhraseData = state.DotPhraseReducer.data;
    }
  }

  if (state.DotPhraseReducer.action === 'EMPTY_DATA' ) {
    if ( state.DotPhraseReducer.data.status != 200 ) {
      toast.error(languageData.global[state.DotPhraseReducer.data.message]);
      return {}
    } else {
      return {}
    }
  }

  if ( state.DotPhraseReducer.action === "DELETE_PHRASE_DATA" ) {
    if ( state.DotPhraseReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.DotPhraseReducer.data.message]);
      returnState.deletePhraseData = state.DotPhraseReducer.data;
    } else {
      toast.success(languageData.global[state.DotPhraseReducer.data.message]);
      returnState.deletePhraseData = state.DotPhraseReducer.data;
    }
  }

  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({fetchDotPhrases: fetchDotPhrases, exportEmptyData: exportEmptyData, deleteDotPhrase: deleteDotPhrase}, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps) (DotPhrases);
