import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import Sidebar from '../../../Containers/Settings/sidebar.js';
import { ToastContainer, toast } from "react-toastify";
import { capitalizeFirstLetter } from '../../../Utils/services.js';
import picClose from '../../../images/close.png';
import { saveDotPhrase, getDotPhrase, updateDotPhrase } from '../../../Actions/Settings/dotPhraseActions.js';

let curObj          = '';

class AddUpdateDotPhrase extends Component {
  constructor(props) {
    super(props);

    const languageData  = JSON.parse(localStorage.getItem('languageData'))
    this.state = {
      showLoader        : false,
      globalLang        : languageData.global,
      dataChanged       : false,
      settingLang       : languageData.settings,
      actionType        : (this.props.match.params.actionType) ? this.props.match.params.actionType : 'create',
      actionID          : (this.props.match.params.actionType && this.props.match.params.actionType === 'edit' && this.props.match.params.id) ? this.props.match.params.id : 0,
      name              : '',
      title             : '',
      phrase            : '',
      nameClass         : "setting-input-box",
      titleClass        : "setting-input-box",
      phraseClass       : "setting-input-box phase-discription",
      returnTo          : "/settings/dot-phrases"
    }
  }

  handleInputChange = (event) => {
     const target = event.target;
     const value = target.type === 'checkbox' ? target.checked : target.value;

     this.setState({[event.target.name]: value , dataChanged : true});
  }

  componentDidMount() {
    if ( this.state.actionType && this.state.actionType === 'edit' && this.state.actionID > 0 ) {
      this.setState({showLoader: true});

      this.props.getDotPhrase(this.state.actionID);
    }
  }

  static getDerivedStateFromProps = (props, state) => {
    if ( props.saveDotPhraseData !== undefined && props.saveDotPhraseData.status === 200 && props.saveDotPhraseData.data !== state.saveDotPhraseData ) {
       return {
         saveDotPhraseData  : props.saveDotPhraseData.data,
         //showLoader         : false,
         saveMessage        : props.saveDotPhraseData.message
       }

     } else if ( props.saveDotPhraseData !== undefined && props.saveDotPhraseData.status !== 200 && props.saveDotPhraseData.data !== state.saveDotPhraseData ) {
       return {
         saveDotPhraseData  : props.saveDotPhraseData.data,
         showLoader         : false,
         saveMessage        : ''
       }
     }

     if ( props.getDotPhraseData !== undefined && props.getDotPhraseData.status === 200 && props.getDotPhraseData.data !== state.getDotPhraseData ) {
        return {
          getDotPhraseData   : props.getDotPhraseData.data,
          showLoader         : false,
          name               : props.getDotPhraseData.data.name,
          title              : props.getDotPhraseData.data.title,
          phrase             : props.getDotPhraseData.data.phrase,
        }

      } else if ( props.getDotPhraseData !== undefined && props.getDotPhraseData.status !== 200 && props.getDotPhraseData.data !== state.getDotPhraseData ) {
        return {
          getDotPhraseData   : props.getDotPhraseData.data,
          showLoader         : false,
        }
      }

      if ( props.updateDotPhraseData !== undefined && props.updateDotPhraseData.status === 200 && props.updateDotPhraseData.data !== state.updateDotPhraseData ) {
         return {
           updateDotPhraseData  : props.updateDotPhraseData.data,
           //showLoader         : false,
           updateMessage        : props.updateDotPhraseData.message
         }

       } else if ( props.updateDotPhraseData !== undefined && props.updateDotPhraseData.status !== 200 && props.updateDotPhraseData.data !== state.updateDotPhraseData ) {
         return {
           updateDotPhraseData  : props.updateDotPhraseData.data,
           showLoader           : false,
           updateMessage        : ''
         }
       }
    return null
  }

  componentDidUpdate = (prevProps, prevState) => {
    if ( this.state.saveDotPhraseData !== null && this.state.saveDotPhraseData !== '' && this.state.saveDotPhraseData !== prevState.saveDotPhraseData && this.state.saveMessage !== null && this.state.saveMessage !== '' ) {
      toast.success(this.state.globalLang[this.state.saveMessage])
      curObj = this

      setTimeout(function(){
        curObj.props.history.push(curObj.state.returnTo);
      }, 1500)
    }

    if ( this.state.updateDotPhraseData !== null && this.state.updateDotPhraseData !== '' && this.state.updateDotPhraseData !== prevState.updateDotPhraseData && this.state.updateMessage !== null && this.state.updateMessage !== '' ) {
      toast.success(this.state.globalLang[this.state.updateMessage])
      curObj = this

      setTimeout(function(){
        curObj.props.history.push(curObj.state.returnTo);
      }, 1500)
    }
  }

  handleSubmit = event => {
    event.preventDefault();

    let isErrorFree = true;

    if ( !this.state.name || this.state.name === '' ) {
      isErrorFree = false;
      this.setState({nameClass: "setting-input-box setting-input-box-invalid"})
    } else if ( this.state.name ) {
      this.setState({nameClass: "setting-input-box"})
    }

    if ( !this.state.title || this.state.title === '' ) {
      isErrorFree = false;
      this.setState({titleClass: "setting-input-box setting-input-box-invalid"})
    } else if ( this.state.name ) {
      this.setState({titleClass: "setting-input-box"})
    }

    if ( !this.state.phrase || this.state.phrase === '' ) {
      isErrorFree = false;
      this.setState({phraseClass: "setting-input-box phase-discription setting-input-box-invalid"})
    } else if ( this.state.name ) {
      this.setState({phraseClass: "setting-input-box phase-discription"})
    }

    if (isErrorFree) {
      this.setState({nameClass: "setting-input-box", titleClass: "setting-input-box", phraseClass: "setting-input-box phase-discription", showLoader: true})

      let formData = {
        name    : this.state.name,
        title   : this.state.title,
        phrase  : this.state.phrase
      }

      if ( this.state.actionType && this.state.actionType === 'edit' && this.state.actionID > 0 ) {
        this.props.updateDotPhrase(formData, this.state.actionID);
      } else {
        this.props.saveDotPhrase(formData);
      }
    }

  }


  render() {
    let returnTo = '';
    returnTo = this.state.returnTo;
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <Sidebar />
          <div className="setting-setion">
            <form autoComplete="off" onSubmit={this.handleSubmit}>
             <div className="setting-container content-min-height">
               <div className="setting-title m-b-40">{(this.state.actionType && this.state.actionType === 'create') ? 'Create Dot Phrase' : 'Edit Dot Phrase'}
               <Link to={returnTo} className="pull-right">
               <img src={picClose}/></Link>
               </div>
               <div className="row">
                 <div className="col-sm-6 col-xs-12">
                   <div className="setting-field-outer">
                     <div className="new-field-label">Dot(.) Phrase  <span className="setting-require">*</span></div>
                     <div className="setting-input-outer">
                       <input autoComplete="off" name="name" className={this.state.nameClass} maxLength={255} type="text" onChange={this.handleInputChange} value={this.state.name}/>
                     </div>
                   </div>
                 </div>
                 <div className="col-sm-6 col-xs-12">
                   <div className="setting-field-outer">
                     <div className="new-field-label">Title  <span className="setting-require">*</span></div>
                     <div className="setting-input-outer">
                       <input autoComplete="off" name="title" className={this.state.titleClass} maxLength={255} type="text" onChange={this.handleInputChange} value={this.state.title}/>
                     </div>
                   </div>
                 </div>
                 <div className="col-xs-12">
                   <div className="setting-field-outer">
                     <div className="new-field-label">Description <span className="setting-require">*</span></div>
                     <textarea name="phrase" className={this.state.phraseClass} col={30} rows={6} cols={30} onChange={this.handleInputChange} value={this.state.phrase}/>
                   </div>
                 </div>
               </div>
             </div>
             <div className="footer-static">
               <input className="new-blue-btn pull-right" type="submit" value="Save"/>
               <Link to={returnTo} className="new-white-btn pull-right cancelAction">Cancel</Link>
             </div>
            </form>
            <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
              <div className="loader-outer">
                <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.loading_please_wait_text}</div>
              </div>
            </div>
          </div>
         </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const languageData  = JSON.parse(localStorage.getItem("languageData"));
  const returnState   = {};

  if ( state.DotPhraseReducer.action === "SAVE_PHRASE_DATA" ) {
    if ( state.DotPhraseReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.DotPhraseReducer.data.message]);
      returnState.saveDotPhraseData = state.DotPhraseReducer.data;
    } else {
      returnState.saveDotPhraseData = state.DotPhraseReducer.data;
    }
  }

  if ( state.DotPhraseReducer.action === "GET_A_PHRASE_DATA" ) {
    if ( state.DotPhraseReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.DotPhraseReducer.data.message]);
      returnState.getDotPhraseData = state.DotPhraseReducer.data;
    } else {
      returnState.getDotPhraseData = state.DotPhraseReducer.data;
    }
  }

  if ( state.DotPhraseReducer.action === "UPDATE_PHRASE_DATA" ) {
    if ( state.DotPhraseReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.DotPhraseReducer.data.message]);
      returnState.updateDotPhraseData = state.DotPhraseReducer.data;
    } else {
      returnState.updateDotPhraseData = state.DotPhraseReducer.data;
    }
  }

  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({saveDotPhrase: saveDotPhrase, getDotPhrase: getDotPhrase, updateDotPhrase: updateDotPhrase}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps) (AddUpdateDotPhrase);
