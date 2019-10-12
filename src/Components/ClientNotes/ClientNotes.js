import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { geClientNotes, saveClientNote, deleteClientNote, getAClientNote } from '../../Actions/ClientNotes/clientNotesActions.js';
import { getUser, checkIfPermissionAllowed, numberFormat } from '../../Utils/services.js';
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'
import { ToastContainer, toast } from "react-toastify";
import { capitalizeFirstLetter, showFormattedDate } from '../../Utils/services.js';
import { animateScroll } from "react-scroll";


class ClientNotes extends Component {
  constructor(props) {
    super(props);
    this.escFunction    = this.escFunction.bind(this);
    const languageData  = JSON.parse(localStorage.getItem('languageData'))

    this.state = {
      backURLType     : (this.props.match.params.actionType) ? this.props.match.params.actionType : 'clients',
      action          : (this.props.match.params.type) ? this.props.match.params.type : 'profile',
      patientID       : (this.props.match.params.patientID !== null && this.props.match.params.patientID !== '' && this.props.match.params.patientID) ? this.props.match.params.patientID : 0,
      showLoader      : false,
      customerNotes   : [],
      patientData     : [],
      customerNote    : [],
      showModal       : false,
      dataChanged     : false,
      noteText        : '',
      noteClass       : 'setting-textarea-box',
      tags            : [],
      noteTobeDeleted : 0,
      noteTobeEdited  : 0,
      languageData    : languageData.procedure,
      globalLang      : languageData.global,
      showSearchResult: false,
      caretPos        : -1,
    };
  }


  escFunction(event) {
    if (event.keyCode === 27) {
      this.setState({showSearchResult: false, caretPos: -1})
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);

    this.setState({showLoader: true})

    let formData = {'params':{
        patient_id    : this.state.patientID,
      }
    }
    this.showLoaderFunc();
    this.props.geClientNotes(formData);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  showLoaderFunc = ()  => {
    this.setState({showLoader: true});
    localStorage.setItem("showLoader", true);
  }

  static getDerivedStateFromProps(props, state) {
    if ( props.customerNotes !== undefined && props.customerNotes.status === 200 && props.customerNotes !== state.customerNotes ) {
      if (localStorage.getItem("showLoader") == "false") {
        localStorage.setItem("showLoader", true);

        if ( !props.customerNotes.data.patient_detail ) {
          setTimeout(function() {
              window.location.href = '/clients';
          }, 0)
        }

        return {
          customerNotes : props.customerNotes.data.patient_notes,
          patientData   : props.customerNotes.data.patient_detail,
          showLoader    : false,
          dotPhrases    : props.customerNotes.data.dot_phrases_list,
          dotPhrasesArr : props.customerNotes.data.dot_phrases_list,
        }
      }
    } else if ( props.customerNotes !== undefined && props.customerNotes.status !== 200 && props.customerNotes !== state.customerNotes ) {
      if (localStorage.getItem("showLoader") == "false") {
        localStorage.setItem("showLoader", true);
        return {
          customerNotes : props.customerNotes.data.patient_notes,
          patientData   : props.customerNotes.data.patient_detail,
          showLoader    : false,
          dotPhrases    : props.customerNotes.data.dot_phrases_list,
          dotPhrasesArr : props.customerNotes.data.dot_phrases_list,
        }
      }
    }

    if ( props.customerNote !== undefined && props.customerNote.status === 200 && props.customerNote.data && props.customerNote.data !== state.customerNote.data && state.noteTobeEdited > 0 ) {
      let hashtags    = (props.customerNote.data.hashtags && props.customerNote.data.hashtags !== undefined && props.customerNote.data.hashtags !== '' && props.customerNote.data.hashtags !== null ) ? props.customerNote.data.hashtags.split(',') : ''
      let note        = (props.customerNote.data.notes && props.customerNote.data.notes !== '' && props.customerNote.data.notes !== null) ? props.customerNote.data.notes : ''
      if (localStorage.getItem("showLoader") == "false") {
        return {
          customerNote  : props.customerNote.data,
          showLoader    : false,
          tags          : (state.dataChanged) ? state.tags : hashtags,
          noteText      : (state.dataChanged) ? state.noteText : note
        }
      }
    } else if ( props.customerNote !== undefined && props.customerNote.status !== 200 && props.customerNote.data && props.procedureNote.data !== state.customerNote.data && state.noteTobeEdited > 0 ) {
      if (localStorage.getItem("showLoader") == "false") {
        return {
          customerNote  : props.procedureNote.data,
          showLoader    : false,
          noteTobeEdited: 0
        }
      }
    }

    if ( props.deleteNoteData !== undefined && props.deleteNoteData.status === 200 && props.deleteNoteData.data !== state.deleteNoteData && state.noteTobeDeleted > 0 ) {
      document.getElementById(state.noteTobeDeleted).style.display = "none";

       return {
         deleteNoteData     : props.deleteNoteData.data,
         showLoader         : false,
         noteTobeDeleted    : 0,
         editNoteID         : 0
       }

     } else if ( props.deleteNoteData !== undefined && props.deleteNoteData.status !== 200 && props.deleteNoteData.data !== state.deleteNoteData ) {
       return {
         deleteNoteData     : props.deleteNoteData.data,
         showLoader         : false,
       }
     }

    return null
  }

  getLoggedInUserData = () => {
    let userData = JSON.parse(getUser())
    if ( userData ) {
      return userData.user.id
    }
    return 0
  }

  showDeleteModal = (obj) => {
    this.state.noteTobeDeleted = obj.id;
    this.setState({showModal: true, showSearchResult: false, dataChanged: false, noteTobeDeleted: obj.id})
  }

  editThisNote = (e) => {
    e.preventDefault();
    this.state.noteTobeEdited = e.target.name;
    this.showLoaderFunc();

    if ( this.state.noteTobeEdited > 0 ) {
      this.setState({showSearchResult: false, dataChanged: false});
      this.props.getAClientNote(this.state.noteTobeEdited)
    }

  }

  dismissDeleteModal = () => {
     this.state.noteTobeDeleted = 0
     this.setState({showModal: false, noteTobeDeleted: 0})
  }

  deleteNote = () => {
    let noteID      = this.state.noteTobeDeleted
    let patientID   = this.state.patientID

    if ( noteID > 0 && patientID > 0 ) {
      this.showLoaderFunc();
      this.setState({tags: [], dataChanged : false, customerNote: [], noteText: "", noteClass:'setting-textarea-box', showLoader: true, showModal: false, noteTobeDeleted: noteID});

      this.props.deleteClientNote(noteID, patientID)

      let notesRef              = this.refs.notes;
      this.state.customerNote   = [];
      this.state.tags           = [];
      this.state.noteText       = "";
      notesRef.value            = "";
    } else {
      toast.error("Can not delete this note at this time");
    }
  //  this.setState({showModal: false, noteTobeDeleted: 0, customerNotes: []})
  }

  handleSubmit = (event) => {
    event.preventDefault();
    let noteID = this.state.noteTobeEdited;

    if (typeof this.state.noteText === undefined || this.state.noteText === null || this.state.noteText === '') {
      this.setState({
        noteClass:'setting-textarea-box setting-input-box-invalid'
      })
    } else if (this.state.noteText) {
      this.showLoaderFunc();
      this.setState({
        noteClass:'setting-textarea-box',
        customerNotes: []
      })

      let formData = {
        patient_id    : this.state.patientID,
        notes         : this.state.noteText,
      }

      let notesRef    = this.refs.notes;

      if ( this.state.tags && this.state.tags.length > 0 ) {
        formData.tags = this.state.tags
      }

      this.props.saveClientNote(formData, noteID);

      this.state.customerNote   = []
      this.state.tags           = []
      this.state.noteText       = ""
      notesRef.value            = ""

      this.setState({tags: [], dataChanged : false, customerNote: [], noteText: "", noteTobeEdited: 0, customerNotes: []});
    }
  }

  handleChange = (value) => {
      this.setState({tags: value, dataChanged : true});
  }

  handleInputChange = (event) => {
     const target       = event.target;
     const value        = target.type === 'checkbox' ? target.checked : target.value;
     let filteredArray  = [];

     let strValue       = value.substring(0, event.target.selectionStart);
     let strArray       = strValue.split('.');
     let strToCheck     = ''
     strToCheck         = '.'+strArray[strArray.length - 1];

    if ( event.target.name === "noteText" && strToCheck.length > 0 && strValue.lastIndexOf('.') !== -1 && (strToCheck.lastIndexOf(".") !== -1 && strToCheck.indexOf(' ', strToCheck.lastIndexOf(".") + 1) === -1)) {

      if ( this.state.dotPhrases && this.state.dotPhrases.length > 0 ) {
        this.state.dotPhrases.map((obj, idx) => {
          let name     = obj.name.toLowerCase();
          let needle   = strToCheck.toLowerCase();
          needle       = needle.substr(1);
            if ( name.includes(needle) || name === needle ) {
              let filterObj = {};

              filterObj.id     = obj.id;
              filterObj.name   = obj.name;
              filterObj.title  = obj.title;
              filterObj.phrase = obj.phrase;

              filteredArray.push(filterObj);
            }
        })
      }

      this.setState({[event.target.name]: value, dataChanged : true, showSearchResult: true, caretPos: event.target.selectionStart, dotPhrasesArr: filteredArray}, this.scrollToTop);
    } else {
      this.setState({[event.target.name]: value, dataChanged : true, showSearchResult: false, caretPos: -1});
    }
  }

  scrollToTop() {
    animateScroll.scrollToTop({
      containerId: "dotPhraseList",
      duration: 10,
      delay: 10,
    });
  }

  cancelEditing = (event) => {
    event.preventDefault();

    let notesRef              = this.refs.notes;
    this.state.customerNote   = []
    this.state.tags           = []
    this.state.noteText       = ""
    notesRef.value            = ""

    this.setState({tags: [], dataChanged : false, customerNote: [], noteText: "", noteTobeEdited: 0, noteClass: 'setting-textarea-box'});
  }

  selectPhrase = (obj) => {
    let noteText = this.state.noteText;
    let phrase   = obj.phrase;
    let position = this.state.caretPos;

    let strValue       = noteText.substring(0, position);
    let strArray       = strValue.split('.');
    let deduction      = strArray[strArray.length - 1]
    deduction          = deduction.length + 1;
    let output         = [noteText.slice(0, (position - deduction)), phrase, noteText.slice(position)].join('');

    this.setState({noteText: output, showSearchResult: false, caretPos: -1});

    document.getElementById("notes").focus();
  }


  render() {
    let returnUrl         = '';

    if ( this.state.backURLType && this.state.backURLType === 'clients' ) {
      returnUrl = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.patientID  : "/" + this.state.backURLType
    } else {

    }

    let noteTimelineClass = (this.state.customerNotes && this.state.customerNotes.length > 0 && checkIfPermissionAllowed('view-customer-notes')) ? "note-timeline can-see" : "note-timeline no-display"

    let noRecordClass     = (this.state.customerNotes && this.state.customerNotes.length > 0 ) ? "no-record no-display" : "no-record"

    let firstname         = (this.state.patientData && this.state.patientData.firstname) ? this.state.patientData.firstname : ""
    let lastname          = (this.state.patientData && this.state.patientData.lastname) ? this.state.patientData.lastname : ""

    let patientName       = firstname + " " + lastname

    return (
      <div id="content">
          <div className="wide-popup">
            <div className="modal-blue-header">
              <Link to={returnUrl} className="popup-cross">×</Link>
              {this.state.showLoader === false && <span className="popup-blue-name">{patientName + ` - ${this.state.languageData.cus_head_cus_notes_text}`}</span>}
            </div>

            <div className="wide-popup-wrapper time-line">
              {(checkIfPermissionAllowed('add-update-customer-notes')) && <div>
                <div className="juvly-subtitle">{this.state.languageData.pro_add_note_text}</div>
                <div className="row">
                  <div className="col-xs-12">
                    <form id="add-notes" name="ar-add-notes-form" className="nobottommargin" action="#" method="post">
                      <div className="row">
                        <div className="col-xs-12">
                          <div className="setting-field-outer relative">
                            <div className="new-field-label">{this.state.languageData.pro_note_text} <span className="setting-require">*</span></div>
                            <textarea placeholder="Type your notes and hashtags here" ref="notes" id="notes" style={{overFlow: ''}} className={this.state.noteClass} name="noteText" onChange={this.handleInputChange} value={this.state.noteText}></textarea>

                            <ul id="dotPhraseList" className={(this.state.dotPhrasesArr && this.state.dotPhrasesArr.length > 0 && this.state.showSearchResult) ? " search-dropdown dot-phrase-list" : "cal-dropdown clinicname-dropdown no-display"}>
                            {this.state.dotPhrasesArr && this.state.dotPhrasesArr.length > 0 && this.state.dotPhrasesArr.map((obj, idx) => {
                                return(
                                    <li key={"phrase_"+idx} onClick={() => this.selectPhrase(obj)}>
                                      <a>
                                          <span>{obj && obj.name && obj.name}</span>
                                          <p>{obj && obj.title && obj.title}</p>
                                      </a>
                                    </li>
                                  )
                              })}
                            </ul>
                            {/*<ul className={(this.state.dotPhrasesArr && this.state.showSearchResult && this.state.dotPhrasesArr.length === 0) ? "search-dropdown dot-phrase-list" : " cal-dropdown clinicname-dropdown no-display"}>
                              <li><a>There were no matches, please enter relevant keywords</a></li>
                            </ul>*/}
                          </div>
                        </div>
                        {/*<div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.languageData.pro_note_hashtag_text}</div>
                            <div className="setting-input-box">
                                 <TagsInput value={(this.state.tags) ? this.state.tags : []} onChange={this.handleChange} />
                            </div>
                          </div>
                        </div>*/}
                        <div className="col-xs-12">
                          <input onClick={this.handleSubmit} className="new-blue-btn pull-left no-margin" value={this.state.languageData.pro_save_btn_text} type="submit" id="save-profile"/>

                          {(this.state.noteTobeEdited && this.state.noteTobeEdited > 0) ? <input onClick={this.cancelEditing} className="new-red-btn pull-left no-margin  m-l-5" value="Cancel" type="button"/> : ''}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>}

              <div className={(this.state.showModal === true ) ? 'overlay' : ''}></div>
              <div id="filterModal" role="dialog" className={(this.state.showModal === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" onClick={this.dismissDeleteModal}>×</button>
                      <h4 className="modal-title" id="model_title">{this.state.languageData.pro_delete_confirmation_text}</h4>
                    </div>
                    <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                      {this.state.languageData.pro_are_you_sure_text}
                    </div>
                    <div className="modal-footer" >
                      <div className="col-md-12 text-left" id="footer-btn">
                        <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissDeleteModal}>{this.state.languageData.pro_no_text}</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteNote}>{this.state.languageData.pro_yes_text}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {(this.state.showLoader === false) && <div className={noRecordClass}>{this.state.languageData.pro_no_notes_text}</div>}
              {(this.state.showLoader === true) && <div className="no-record">{this.state.languageData.pro_loading_dot}</div>}
              <div className={noteTimelineClass}>
              {
                checkIfPermissionAllowed('view-customer-notes') && this.state.customerNotes !== undefined && this.state.customerNotes.map((noteobj, noteidx) => {
                  return (
                    (noteobj.user !== null) && <div id={noteobj.id} className="row" key={noteidx}>
                      <div className="circle" />
                      <div className="col-sm-4 col-xs-12 note-subject">
                        <h4>{(noteobj.user !== null ) ? noteobj.user.firstname : ''} {(noteobj.user !== null ) ? noteobj.user.lastname : ''} {this.state.languageData.pro_left_a_note_text}</h4>
                        <p>{showFormattedDate(noteobj.created, true)}</p>
                      </div>
                      <div className="col-sm-6 col-xs-12" id="note-content">
                        <div className="note-content">{noteobj.notes}<br />
                        {
                          (noteobj.hashtags) && noteobj.hashtags.split(',').map((hashObj, hashIdx) => {
                              return(
                                <span key={hashIdx} className="hashTag">{hashObj} </span>
                              )
                          })
                        }

                        </div>
                        <textarea className="no-display" defaultValue="" />
                      </div>
                      <div className="col-sm-2 col-xs-12 no-padding">
                        {
                          (checkIfPermissionAllowed('add-update-customer-notes') && this.getLoggedInUserData() === noteobj.user.id ) ? <a id="edit-note" className="easy-link" name={noteobj.id} onClick={this.editThisNote.bind(this)}>{this.state.languageData.pro_edit_btn_text}</a> : ``}

                        {(checkIfPermissionAllowed('add-update-customer-notes') && this.getLoggedInUserData() === noteobj.user.id) ? <a id="delete-note" className="easy-link" name={noteobj.id} onClick={() => this.showDeleteModal(noteobj)}>{this.state.languageData.pro_del_btn_text}</a> : ``}
                      </div>
                    </div>
                    );
                })}

              </div>
            </div>
            <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
              <div className="loader-outer">
                <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.Please_Wait}</div>
              </div>
            </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));

  localStorage.setItem("showLoader", false);

  if ( state.ClientNotesReducer.action === 'GET_CLIENT_NOTES' ) {
    return {
      customerNotes : state.ClientNotesReducer.data
    }
  }

  if ( state.ClientNotesReducer.action === 'SAVE_CLIENT_NOTES' ) {
    toast.dismiss();

    if ( state.ClientNotesReducer.data.status !== 201 ) {
      toast.error(languageData.global[state.ClientNotesReducer.data.message]);
      return {
        customerNotes : state.ClientNotesReducer.data
      }
    } else {
      toast.success(languageData.global[state.ClientNotesReducer.data.message]);
      return {
        customerNotes : state.ClientNotesReducer.data
      }
    }
  }

  if ( state.ClientNotesReducer.action === 'DELETE_CLIENT_NOTE' ) {
    toast.dismiss();

    if ( state.ClientNotesReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientNotesReducer.data.message]);
      return {
        deleteNoteData : state.ClientNotesReducer.data
      }
    } else {
      toast.success(languageData.global[state.ClientNotesReducer.data.message]);
      return {
        deleteNoteData : state.ClientNotesReducer.data
      }
    }
  }

  if ( state.ClientNotesReducer.action === 'UPDATE_CLIENT_NOTE' ) {
    toast.dismiss();

    if ( state.ClientNotesReducer.data.status !== 201 ) {
      toast.error(languageData.global[state.ClientNotesReducer.data.message]);
      return {
        customerNotes : state.ClientNotesReducer.data
      }
    } else {
      toast.success(languageData.global[state.ClientNotesReducer.data.message]);
      return {
        customerNotes : state.ClientNotesReducer.data
      }
    }
  }

  if ( state.ClientNotesReducer.action === 'GET_CLIENT_NOTE' ) {
    toast.dismiss();

    if ( state.ClientNotesReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientNotesReducer.data.message]);
      return {
        customerNote : state.ClientNotesReducer.data
      }
    } else {
      return {
        customerNote : state.ClientNotesReducer.data
      }
    }
  }

  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({geClientNotes: geClientNotes, saveClientNote: saveClientNote, deleteClientNote: deleteClientNote, getAClientNote: getAClientNote}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps) (withRouter(ClientNotes));
