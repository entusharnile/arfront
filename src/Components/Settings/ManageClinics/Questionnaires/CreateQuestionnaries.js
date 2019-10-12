import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Sidebar from "../../../../Containers/Settings/sidebar.js";
import validator from "validator";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import config from "../../../../config";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import {
  deleteQuestion,
  getQuestionById,
  getQuestionnaireById,
  createQuestionnaire,
  createQuestion,
  uploadImage,
  updateQuestion,
  deleteQuestionnaire,
  updateQuestionnaire,
  updateSortOrder,
  exportEmptyData
} from "../../../../Actions/Settings/settingsActions.js";
import { geCommonTrackEvent } from '../../../../Actions/Common/commonAction.js';

const questionnaireInstance = axios.create();
questionnaireInstance.interceptors.response.use(
  function(response) {
    // Do something with response data
    return response;
  },
  function(error) {
    if (!error.response) {
      return { data: { data: "", message: "file_type_error", status: 400 } };
    }
  }
);
class CreateQuestionnaries extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pictures: [],
      consultation_title: "",
      userChanged: false,
      questionnaireData: {},
      question: "",
      question_type: "yesno",
      div_display_text: "row add-questions-multi-text no-margin no-display ",
      div_display_image: "row add-questions-multi-text no-margin no-display",
      div_edit_display_text: "row edit-questions-multi-text no-margin",
      div_edit_display_image: "row edit-questions-multi-images no-margin",
      itemArray: [],
      questionId: "",
      yes_no: "yesno",
      multi_text: "multitext",
      multi_images: "multiimage",
      multiTextArr: [{ text: "" }],
      multiImageArr: [{ image: "", image_label: "" }],
      text: "",
      question_data: [],
      multiple_selection: 1,
      display_labels: 1,
      file: "",
      image_label: "",
      isDisabled: true,
      isEditDisabled: true,
      questionnaires: "",
      edit_question_type: "",
      edit_multiple_selection: "1",
      edit_question: "",
      showLoader: false,
      multiple_selection_image: "1",
      display_labels: 1
    };
    window.onscroll = () => {
      return false;
    };
  }

  showDeleteModal = event => {
    const languageData = JSON.parse(localStorage.getItem("languageData"));
    let question_id = event.target.dataset.id;
    this.setState({
      showModal: true,
      deleteId: question_id,
      delete_warning: languageData.settings["question_delete_warning"]
    });
  };

  deleteEditRow = e => {
    this.setState({ showLoader: true });
    this.props.getQuestionnaireById(this.state.qId);
  };

  showQuestionnaireDeleteModal = event => {
    const languageData = JSON.parse(localStorage.getItem("languageData"));
    let question_id = event.target.dataset.id;
    this.setState({
      showModal: true,
      deleteId: question_id,
      delete_warning: languageData.settings["questionnaire_delete_warning"]
    });
  };

  dismissModal = () => {
    this.setState({ showModal: false });
  };

  deleteQuestion = () => {
    this.setState({ showLoader: true, hideBtns: true });
    this.dismissModal();
    let cId = this.state.deleteId;
    if (cId) {
      this.props.deleteQuestion(this.state.qId, cId);
    } else {
      this.props.deleteQuestionnaire(this.state.qId);
    }
  };

  createProject = () => {
    const item = this.state.itemArray;
    const question = this.state.question;
    const question_type = this.state.question_type;
    let new_managed_state = [...this.state.multiTextArr];
    if (question.trim() == "") {
      this.setState({ question_Error: true });
      return;
    } else {
      this.setState({ question_Error: false });
    }
    let questionObj = {};
    questionObj.question = question;
    questionObj.question_type = question_type;

    if (question_type == "multitext") {
      if (this.state.multiTextArr.length) {
        if (this.state.multiTextArr.length == 1) {
          if (this.state.multiTextArr[0].text == "") {
            this.setState({ multiTextError_0: true });
            return false;
          }
        } else {
          let error = false;
          let returnState = {};
          this.state.multiTextArr.map((obj, idx) => {
            if (obj.text == undefined || obj.text.trim() == "") {
              returnState["multiTextError_" + idx] = true;
              error = true;
            } else {
              returnState["multiTextError_" + idx] = false;
            }
          });
          if (error) {
            this.setState(returnState);
            return false;
          }
        }
        questionObj.multi_text_data = this.state.multiTextArr;
        questionObj.multiple_selection = this.state.multiple_selection;
      }
      // mark input as empty when form is submitted 
      const new_text_state_data = {};
      new_managed_state.map((obj, index) => {
         new_text_state_data[`text_${index}`] = '';
      });
     
       this.setState(new_text_state_data);
    } else if (question_type == "multiimage") {
      if (this.state.multiImageArr.length) {
        if (this.state.multiImageArr.length == 1) {
          if (
            this.state.multiImageArr[0].image == "" ||
            this.state.multiImageArr[0].image == undefined ||
            this.state.multiImageArr[0].image_label.trim() == ""
          ) {
            this.setState({ multiImageError_0: true });
            return false;
          }
        } else {
          let error = false;
          let returnState = {};
          this.state.multiImageArr.map((obj, idx) => {
            if (
              obj.image_label == undefined ||
              obj.image.trim() == "" ||
              obj.image_label.trim() == ""
            ) {
              returnState["multiImageError_" + idx] = true;
              error = true;
            } else {
              returnState["multiImageError_" + idx] = false;
            }
          });
          if (error) {
            this.setState(returnState);
            return false;
          }
        }
        questionObj.multi_image_data = this.state.multiImageArr;
        questionObj.multiple_selection = this.state.multiple_selection_image;
        questionObj.display_labels = this.state.display_labels;
      }
    } else {
      questionObj.multiple_selection = 0;
    }

    if (this.state.qId) {
      this.setState({
        itemArray: item,
        multiTextArr: [{ text: "" }],
        multiImageArr: [{ image: "", image_label: "" }],
        question: "",
        question_type: "yesno",
        isDisabled: false,
        div_display_image: "row  add-questions-multi-text no-margin no-display",
        div_display_text: "row add-questions-multi-text no-margin no-display",
        question_Error: false,
        multiple_selection: 1,
        showLoader: true,
        multiple_selection_image: "1",
        display_labels: "1"
      });
      this.props.createQuestion(questionObj, this.state.qId);
    } else {
      item.push(questionObj);
      this.setState({
        itemArray: item,
        multiTextArr: [{ text: "" }],
        multiImageArr: [{ image: "", image_label: "" }],
        question: "",
        question_type: "yesno",
        isDisabled: false,
        div_display_image: "row  add-questions-multi-text no-margin no-display",
        div_display_text: "row add-questions-multi-text no-margin no-display",
        question_Error: false,
        multiple_selection: 1,
        multiple_selection_image: "1",
        display_labels: "1"
      });
    }
  };

  deleteItem = event => {
    const item = this.state.itemArray;
    const id = event.target.dataset.id;
    item.splice(id, 1);
    this.setState({ itemArray: item });
  };

  editItem = event => {
    const id = event.target.dataset.id;
    this.setState({ edit_question_id: id, showLoader: true });
    this.props.getQuestionById(this.state.qId, id);
  };

  deleteTextOption = event => {
    let q = {};
    let returnState = {}
    const item = this.state.multiTextArr;
    if (item.length == 1) {
      return false;
    }
    const id = event.target.dataset.optionid;
    for(let x in this.state) {
      if(x.startsWith('text_')) {
        delete this.state[x];
      }
    }
    //delete item[id];

    item.splice(id, 1);
    returnState = this.state
    //let arr = this.state.multiTextArr;
    item.map((obj, idx) => {
      returnState["text_" + idx] = obj.text;
    });
    returnState.multiTextArr = item;

    this.setState(returnState);
  };

  deleteImageOption = event => {
    let q = {};
    let returnState = {}
    let item = this.state.multiImageArr;

    const id = event.target.dataset.optionid;
    if (item.length == 1) {
      return false;
    }
    //delete item[id];

    item.splice(id, 1);
    for(let x in this.state) {
      if(x.startsWith('image_')) {
        delete this.state[x];
      }
    }

    returnState = this.state
    /*if (this.state["image_" + id])
      delete returnState["image_" + id];

    if (this.state["image_label_" + id])
      delete returnState["image_label_" + id];
    //let arr = this.state.multiTextArr;*/
    item.map((obj, idx) => {
      returnState["image_" + idx] = obj.image;
      returnState["image_label_" + idx] = obj.image_label;
    });
    returnState.multiImageArr = item;
    this.setState(returnState);
  };

  deleteEditTextOption = event => {
    let q = {};
    let returnState = {}
    const item = this.state.edit_choices;
    const id = event.target.dataset.optionid;
    //delete item[id];
    if (item.length == 1) {
      return false;
    }

    for(let x in this.state) {
      if(x.startsWith('edit_text_')) {
        delete this.state[x];
      }
    }
    item.splice(id, 1);
    returnState = this.state


    //let arr = this.state.multiTextArr;
    item.map((obj, idx) => {
      returnState["edit_text_" + idx] = obj.text;
    });
    returnState.edit_choices = item;

    this.setState(returnState);
  };

  deleteEditImageOption = event => {
    let q = {};
    let returnState = {};
    let item = this.state.edit_choices;
    if (item.length == 1) {
      return false;
    }
    let id = event.target.dataset.optionid;
    //delete item[id];

    item.splice(id, 1);

    for(let x in this.state) {
      if(x.startsWith('edit_image_')) {
        delete this.state[x];
      }
    }

    //let arr = this.state.multiTextArr;
    item.map((obj, idx) => {
      returnState["edit_image_" + idx] = obj.image;
      returnState["edit_image_label_" + idx] = obj.image_label;
    });
    returnState.edit_choices = item;
    this.setState(returnState);
  };

  addMultiTextOption = () => {
    let arr = this.state.multiTextArr,
      err = false,
      errArr = {},
      returnState = {};

    if (arr.length) {
      arr.map((obj, idx) => {
        if (
          this.state["text_" + idx] != undefined &&
          this.state["text_" + idx].trim() != ""
        ) {
          arr[idx].text = this.state["text_" + idx];
          err = true;
          returnState["multiTextError_" + idx] = false;
        } else {
          returnState["multiTextError_" + idx] = true;
          err = false;
        }
      });
      if (Object.keys(errArr).length != 0) {
        this.setState(returnState);
        return;
      }
      if (err) {
        arr.push({ text: "" });
      }
    }
    returnState.multiTextArr = arr;
    this.setState(returnState);
  };

  editMultiTextOption = () => {
    let arr = this.state.edit_choices,
      err = false,
      errArr = {},
      returnState = {};
    if (arr.length) {
      arr.map((obj, idx) => {
        if (
          this.state["edit_text_" + idx] != undefined &&
          this.state["edit_text_" + idx].trim() != ""
        ) {
          arr[idx].text = this.state["edit_text_" + idx];
          err = true;
          returnState["multiEditTextError_" + idx] = false;
        } else {
          returnState["multiEditTextError_" + idx] = true;
          err = false;
        }
      });
      if (Object.keys(errArr).length != 0) {
        this.setState(returnState);
        return;
      }
      if (err) {
        arr.push({ text: "" });
        returnState["edit_text_" + arr.length - 1] = "";
      }
    }
    returnState.edit_choices = arr;

    this.setState(returnState);
  };

  addMultiImageOption = () => {
    let arr = this.state.multiImageArr,
      err = false,
      errArr = {},
      returnState = {};

    if (arr.length) {
      arr.map((obj, idx) => {
        if (
          this.state["image_" + idx] != undefined &&
          this.state["image_" + idx].trim() != ""
        ) {
          if (
            this.state["image_label_" + idx] != undefined &&
            this.state["image_label_" + idx].trim() != ""
          ) {
            arr[idx].image = this.state["image_" + idx];
            arr[idx].image_label = this.state["image_label_" + idx];
            err = true;
            returnState["multiImageError_" + idx] = false;
          } else {
            returnState["multiImageError_" + idx] = true;
            err = false;
          }
        } else {
          returnState["multiImageError_" + idx] = true;
          err = false;
        }
      });

      if (Object.keys(errArr).length != 0) {
        this.setState(returnState);
        return;
      }
      if (err) {
        arr.push({ image: "", image_label: "" });
      }
    }
    returnState.multiImageArr = arr;
    this.setState(returnState);
  };

  editMultiImageOption = () => {
    let arr = this.state.edit_choices,
      err = false,
      errArr = {},
      returnState = {};

    if (arr.length) {
      arr.map((obj, idx) => {
        if (
          this.state["edit_image_" + idx] != undefined &&
          this.state["edit_image_" + idx].trim() != ""
        ) {
          if (
            this.state["edit_image_label_" + idx] != undefined &&
            this.state["edit_image_label_" + idx].trim() != ""
          ) {
            arr[idx].image = this.state["edit_image_" + idx];
            arr[idx].image_label = this.state["edit_image_label_" + idx];
            err = true;
            returnState["multiEditImageError_" + idx] = false;
          } else {
            returnState["multiEditImageError_" + idx] = true;
            err = false;
          }
        } else {
          returnState["multiEditImageError_" + idx] = true;
          err = false;
        }
      });

      if (Object.keys(errArr).length != 0) {
        this.setState(returnState);
        return;
      }
      if (err) {
        arr.push({ image: "", image_label: "" });
      }
    }
    returnState.multiImageArr = arr;
    this.setState(returnState);
  };

  createDiv = () => {
    const divItem = this.state.multiTextArr;
    const text = this.state.text;
    divItem.push({ text });
    this.setState({ multiTextArr: divItem });
  };

  componentDidMount() {
    this.props.exportEmptyData()
    window.onscroll = () => {
      return false;
    }
    const qId = this.props.match.params.id;
    const valTrack = "Questionnaire Setup";
    if(!qId){
      this.props.geCommonTrackEvent(valTrack);
    }
    const languageData = JSON.parse(localStorage.getItem("languageData"));
    this.setState({
      add_questionnaire: languageData.settings["add_questionnaire"],
      view_questionnaire: languageData.settings["view_questionnaire"],
      create_questionnaire: languageData.settings["create_questionnaire"],
      add_new_question: languageData.settings["add_new_question"],
      questionnaire_name: languageData.settings["questionnaire_name"],
      question_data: languageData.settings["question_data"],
      question_type_data: languageData.settings["question_type_data"],
      question_choices: languageData.settings["question_choices"],
      select_yes: languageData.settings["select_yes"],
      select_yes_images: languageData.settings["select_yes_images"],
      question_choices_image: languageData.settings["question_choices_image"],
      settings_question:languageData.settings["settings_question"],
      question_choice_lable: languageData.settings["question_choice_lable"],
      no_option: languageData.settings["no_option"],
      yes_option: languageData.settings["yes_option"],
      showLoader: qId ? true : false,
      qId: qId ? qId : undefined,
      yes_option: languageData.settings["yes_option"],
      no_option: languageData.settings["no_option"],
      delete_warning: "",
      delete_confirmation:languageData.global['delete_confirmation'],
      questionnaire_Label: languageData.settings['questionnaire_Label'],
      Questionnaire_Choose_File: languageData.settings['Questionnaire_Choose_File'],
      questionnaire_Add:  languageData.settings['questionnaire_Add'],
      editUsers_Drop_Files_To_Upload: languageData.settings['editUsers_Drop_Files_To_Upload'],
      yes_option: languageData.settings['yes_option'],
      no_option: languageData.settings['no_option'],
      questionnaire_No_file:  languageData.settings['questionnaire_No_file'],
      question_choices:  languageData.settings['question_choices'],
      questionnaire_Add:  languageData.settings['questionnaire_Add'],
      select_yes:  languageData.settings['select_yes'],
      select_yes_images:  languageData.settings['select_yes_images'],
      questionnaire_Edit_Question: languageData.settings['questionnaire_Edit_Question'],
      question_type_data:  languageData.settings['question_type_data'],
      questionnaire_Multiple_Selection_Text:  languageData.settings['questionnaire_Multiple_Selection_Text'],
      questionnaire_Multiple_Selection_Images:  languageData.settings['questionnaire_Multiple_Selection_Images'],
      editUsers_CancelBtn:  languageData.settings['editUsers_CancelBtn'],
      questionnaire_Question:  languageData.settings['questionnaire_Question'],
      questionnaire_Update:  languageData.settings['questionnaire_Update'],
      questionnaire_A: languageData.settings['questionnaire_A'],
      questionnaire_Questions: languageData.settings['questionnaire_Questions'],
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      edit_Questionnaire: languageData.settings['edit_Questionnaire'],
      settings_view_questionnaire: languageData.settings['settings_view_questionnaire'],

    });

    if (qId) this.props.getQuestionnaireById(qId);
  }

  resetStatevalues = () => {
    let new_managed_state = [...this.state.multiTextArr];
    const new_text_state_data = {};
    new_managed_state.map((obj, index) => {
       new_text_state_data[`text_${index}`] = '';
    });
   
    this.setState(new_text_state_data);
  }
  cancelQuestion = () => {
    this.resetStatevalues();
    this.setState({
      multiTextArr: [{ text: "" }],
      question: "",
      question_type: "yesno",
      isDisabled: false,
      div_display_image: "row  add-questions-multi-text no-margin no-display",
      div_display_text: "row 00-questions-multi-text no-margin no-display",
      question_Error: false,
      multiple_selection: 1
    });
  };

  static getDerivedStateFromProps(props, state) {
    if(props.showLoader != undefined && props.showLoader == false && props.showLoaderTimestamp != state.showLoaderTimestamp) {
        props.exportEmptyData()
        return {showLoader : false, showLoaderTimestamp: props.showLoaderTimestamp};
    }
    if (
      props.questionnaireData !== undefined &&
      (props.questionnaireData.status === 200 ||
        props.questionnaireData.status === 201) &&
      props.questionnaireData.data != state.questionnaireData &&
      props.questionnaireDataTimeStamp != state.questionnaireDataTimeStamp
    ) {
      props.exportEmptyData()
      var itemArray = [];
      var questions = props.questionnaireData.data.questions;
      if (questions.length) {
        questions.map((obj, idx) => {
          itemArray.push({
            question: obj.question,
            question_type: obj.question_type,
            id: obj.id
          });
        });
      }
      return {
        deleteId: (state.userChanged) ? state.deleteId : null,
        questionnaireDataTimeStamp: props.questionnaireDataTimeStamp,
        edit_question_id: null,
        questionData: undefined,
        edit_choices: [],
        editQuestionId: null,
        showLoader: false,
        itemArray: itemArray,
        consultation_title: state.userChanged
          ? state.consultation_title
          : props.questionnaireData.data.consultation_title,
        questionnaireData: state.userChanged
          ? state.questionnaireData
          : props.questionnaireData.data,
        id: state.userChanged
          ? state.userChanged
          : props.questionnaireData.data.id,
        questionnaires: state.userChanged
          ? state.userChanged
          : props.questionnaireData.data.questionnaires,
        multiTextArr: state.userChanged ? state.multiTextArr : [{ text: "" }],
        question: state.userChanged ? state.question : "",
        question_type: state.userChanged ? state.question_type : "yesno",
        //isDisabled : false,
        div_display_image: state.userChanged
          ? state.div_display_image
          : "row  add-questions-multi-text no-margin no-display",
        div_display_text: state.userChanged
          ? state.div_display_text
          : "row add-questions-multi-text no-margin no-display",
        question_Error: state.userChanged ? state.question_Error : false,
        multiple_selection: state.userChanged ? state.multiple_selection : 1
      };
    }
    if (
      props.questionData !== undefined &&
      props.questionData.status === 200 &&
      props.questionData.data != state.questionData &&
      props.questionDataTimeStamp != state.questionDataTimeStamp
    ) {
      props.exportEmptyData()
      let choices = [];
      let choicesText = {};
      if (props.questionData.data.question_type == "multitext") {
        if (props.questionData.data.question_choices) {
          props.questionData.data.question_choices.map((obj, idx) => {
            choices.push({ text: obj.text, id: obj.id });
            choicesText["edit_text_" + idx] = obj.text;
          });
        }
      } else if (props.questionData.data.question_type == "multiimage") {
        props.questionData.data.question_choices.map((obj, idx) => {
          choices.push({
            image: obj.image,
            id: obj.id,
            image_label: obj.image_label
          });
          choicesText["edit_image_" + idx] = obj.image;
          choicesText["edit_image_label_" + idx] = obj.image_label;
        });
        if (props.questionData.data.question_choices.length) {
          choicesText.edit_multiple_selection =
            props.questionData.data.question_choices[0].multiple_selection;
          choicesText.edit_display_labels =
            props.questionData.data.question_choices[0].display_labels;
        }
      }
      choicesText.showLoader = false;
      choicesText.edit_choices = choices;
      choicesText.questionData = props.questionData.data;
      choicesText.edit_question = props.questionData.data.question;
      choicesText.edit_question_type = props.questionData.data.question_type;
      choicesText.edit_question_id = props.questionData.data.id;
      choicesText.questionDataTimeStamp = props.questionDataTimeStamp;
      return choicesText;
    }
    if (props.redirect != undefined && props.redirect == true) {
      //console.log(props.message);
      toast.success(props.message)
      props.history.push("/settings/questionnaires");
    } 
     else return null;
  }

  handleInputChange = event => {
    const target = event.target;
    let value = target.value;
    switch (target.type) {
      case "checkbox": {
        value = target.checked;
        break;
      }
      case "file": {
        value = target.files[0];
        this.setState({ showLoader: true });
        this.handleUpload(event.target.files[0], event.target.name);
      }
    }
    let qType = {};
    if (target.name == "question_type") {
      if (value === "yesno") {
        qType.isDisabled = false;
        qType.div_display_text =
          "row add-questions-multi-text no-margin no-display ";
        qType.div_display_image =
          "row  add-questions-multi-text no-margin no-display";
      } else if (value === "multitext") {
        qType.isDisabled = false;
        qType.div_display_text =
          "row add-questions-multi-text no-margin display ";
        qType.div_display_image =
          "row  add-questions-multi-text no-margin no-display ";
      } else if (value === "multiimage") {
        qType.isDisabled = false;
        qType.div_display_image =
          "row  add-questions-multi-text no-margin display";
        qType.div_display_text =
          "row add-questions-multi-text no-margin no-display ";
      }
    }

    if (target.name == "edit_question_type") {
      if (value === "yesno") {
        qType.isEditDisabled = false;
        qType.div_edit_display_text =
          "row edit-questions-multi-text no-margin no-display ";
        qType.div_edit_display_image =
          "row  edit-questions-multi-text no-margin no-display";
      } else if (value === "multitext") {
        //if(this.state.questionData.question_choices.length == 0) {
        qType.questionData = this.state.questionData;
        qType.questionData.question_choices = [{ multiple_selection: 1 }];

        qType.multiTextArr = [{ text: "" }];
        qType.edit_choices = [{ text: "" }];
        qType.questionData.multiple_selection = 1;
        qType.questionData.question_type = "multitext";
        //}
        qType.isEditDisabled = false;
        qType.div_edit_display_text =
          "row edit-questions-multi-text no-margin display ";
        qType.div_edit_display_image =
          "row  edit-questions-multi-text no-margin no-display ";
      } else if (value === "multiimage") {
        qType.isEditDisabled = false;
        qType.questionData = this.state.questionData;
        qType.multiImageArr = [{ image: "", label: "" }];
        qType.div_edit_display_image =
          "row  edit-questions-multi-text no-margin display";
        qType.div_edit_display_text =
          "row edit-questions-multi-text no-margin no-display ";
        qType.edit_choices = [{ image: "", label: "" }];
        qType.edit_multiple_selection = 1;
        qType.questionData.question_type = "multiimage";
        qType.edit_display_labels = "1";
      }
    }

    if (target.name.startsWith("text_")) {
      let arr = this.state.multiTextArr;
      let currentId = target.name.split("_")[1];

      arr.map((obj, idx) => {
        if (currentId != idx) {
          arr[idx].text = this.state["text_" + idx];
        } else {
          arr[idx].text = value;
        }
      });
      qType.multiTextArr = arr;
    }

    if (target.name.startsWith("image_label_")) {
      let arr = this.state.multiImageArr;
      let currentId = target.name.split("_")[2];
      arr.map((obj, idx) => {
        if (currentId != idx) {
          arr[idx].image = obj.image;
          arr[idx].image_label = obj.image_label;
        } else {
          arr[idx].image_label = value;
        }
      });
      qType.multiImageArr = arr;
    }

    if (target.name.startsWith("edit_text_")) {
      let arr = this.state.edit_choices;
      let currentId = target.name.split("_")[2];

      arr.map((obj, idx) => {
        if (currentId != idx) {
          arr[idx].text = this.state["edit_text_" + idx];
        } else {
          arr[idx].text = value;
        }
      });
      qType.edit_choices = arr;
    }

    if (target.name.startsWith("edit_image_label")) {
      let arr = this.state.edit_choices;
      let currentId = target.name.split("_")[3];

      arr.map((obj, idx) => {
        if (currentId != idx) {
          arr[idx].image = this.state["edit_image_" + idx];
          arr[idx].image_label = this.state["edit_image_label_" + idx]
            ? this.state["edit_image_label_" + idx]
            : "";
        } else {
          arr[idx].image_label = value;
        }
      });
      qType.edit_choices = arr;
    }

    if (target.type != "file") {
      qType[event.target.name] = value;
    }
    qType.userChanged = true;
    this.setState(qType);
  };

  handleUpload = (file, name) => {
    const data = new FormData();
    data.append("file", file, file.name);
    let endpoint = config.API_URL + `media/upload?upload_type=questionnaires`;
    axios
      .post(endpoint, data)
      .then(res => {
        let qType = {};
        if (name.startsWith("edit_image_")) {
          let arr = this.state.edit_choices;
          let currentId = name.split("_")[2];
          let fileName = res.data.data.file_name;
          arr.map((obj, idx) => {
            if (currentId != idx) {
              arr[idx].image = this.state["edit_image_" + idx];
              arr[idx].image_label = this.state["edit_image_label_" + idx]
                ? this.state["edit_image_label_" + idx]
                : "";
            } else {
              arr[idx].image = res.data.data.file_name;
              arr[idx].image_label = this.state["edit_image_label_" + idx]
                ? this.state["edit_image_label_" + idx]
                : "";
            }
          });
          qType.edit_choices = arr;
        } else {
          let arr = this.state.multiImageArr;
          let currentId = name.split("_")[1];

          arr.map((obj, idx) => {
            if (currentId != idx) {
              arr[idx].image = this.state["image_" + idx];
              arr[idx].image_label = this.state["image_label_" + idx]
                ? this.state["image_label_" + idx]
                : "";
            } else {
              arr[idx].image = res.data.data.file_name;
              arr[idx].image_label = this.state["image_label_" + idx]
                ? this.state["image_label_" + idx]
                : "";
            }
          });
          qType.multiImageArr = arr;
        }
        qType[name] = res.data.data.file_name;
        qType.showLoader = false;
        this.setState(qType);
      })
      .catch(error => {
        let languageData = JSON.parse(localStorage.getItem("languageData"));
        toast.error(languageData.global["file_type_error"]);
        this.setState({showLoader: false})
      });
  };

  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };
  getListStyle = isDraggingOver => ({
    background: isDraggingOver ? "lightblue" : "lightgrey"
  });

  getItemStyle = (isDragging, draggableStyle) => {
    return {
      // some basic styles to make the items look a bit nicer
      userSelect: "none",

      // change background colour if dragging
      background: isDragging ? "#f7fbfd" : "ffffff",

      // styles we need to apply on draggables
      ...draggableStyle
    };
  };

  reOrderList = list => {
    let formData = {
      object_ids: list
    };
    //this.setState({ showLoader: true });

    let itemArrayList = list.map((obj, idx) => {
      const itemArray = this.state.itemArray.filter(x => x.id === obj)
      if (itemArray.length === 1) {
        return itemArray[0];
      }
    });
    //this.setState({ itemArrayList: itemArrayList })

    this.props.updateSortOrder(formData, "Question");
  };

  handleSubmit = (event, questionId) => {
    let error = false;
    this.setState({
      consultation_title_Error: false,
      question_Error: false,
      question_type_Error: false
    });

    if (
      !this.state.consultation_title ||
      this.state.consultation_title.trim() == ""
    ) {
      this.setState({ consultation_title_Error: true });
      error = true;
    }
    if (error === true) {
      return;
    }

    let formData = {};
    formData.consultation_title = this.state.consultation_title;

    if (
      this.state.itemArray.length ||
      this.state.consultation_title.trim() == ""
    ) {
      formData.question_data = this.state.itemArray;
    }

    if (this.state.qId) {
      this.props.updateQuestionnaire(formData, this.state.qId);
    } else {
      this.setState({showLoader: true})
      this.props.createQuestionnaire(formData);
    }
  };

  updateQuestion = () => {
    let formData = {};
    let returnState = {};
    if (
      this.state.edit_question == "" ||
      this.state.edit_question == undefined
    ) {
      this.setState({ editQuestionError: true });
      return false;
    }

    // Prepare formData
    formData.question = this.state.edit_question;
    formData.question_type = this.state.edit_question_type;

    if (this.state.edit_question_type == "yesno") {
      formData.multiple_selection = 0;
      formData.display_labels = 0;
    } else if (this.state.edit_question_type == "multitext") {
      let multiTextArr = [];

      let error = false;
      this.state.edit_choices.map((obj, idx) => {
        if (obj.text.trim() == "") {
          returnState["multiEditTextError_" + idx] = true;
          error = true;
        } else {
          returnState["multiEditTextError_" + idx] = false;
          multiTextArr.push({ text: obj.text });
        }
      }); //true
      if (error) {
        this.setState(returnState);
        return false;
      }
      formData.multi_text_data = multiTextArr;
      formData.multiple_selection = this.state.edit_multiple_selection;
      formData.display_labels = 0;
    } else {
      let multiImageArr = [];
      let error = false;
      this.state.edit_choices.map((obj, idx) => {
        if (obj.image.trim() == "" || obj.image_label.trim() == "") {
          returnState["multiEditImageError_" + idx] = true;
          error = true;
        } else {
          returnState["multiEditImageError_" + idx] = false;
        }
      }); //true
      if (error) {
        this.setState(returnState);
        return false;
      }
      formData.multi_image_data = this.state.edit_choices;
      formData.multiple_selection = this.state.edit_multiple_selection;
      formData.display_labels = this.state.edit_display_labels;
    }
    returnState.showLoader = true;
    this.setState(returnState);
    this.props.updateQuestion(
      formData,
      this.state.qId,
      this.state.edit_question_id
    );
  };

  handleSelect = event => {
    if (this.state.question_type === "yesno") {
      this.setState({
        isDisabled: false,
        div_display_text: "row add-questions-multi-text no-margin no-display ",
        div_display_image: "row  add-questions-multi-text no-margin no-display "
      });
    } else if (this.state.question_type === "multitext") {
      this.setState({
        isDisabled: false,
        div_display_text: "row add-questions-multi-text no-margin display ",
        div_display_image: "row  add-questions-multi-text no-margin no-display "
      });
    } else if (this.state.question_type === "multiimage") {
      this.setState({
        isDisabled: false,
        div_display_image: "row  add-questions-multi-text no-margin display",
        div_display_text: "row add-questions-multi-text no-margin no-display "
      });
    }
  };
  render() {
    var onDragEnd = result => {
      // dropped outside the list

      /*  const { source, destination } = result;
    if (!source.droppableId) {
      return;
    }

    if (source.droppableId != destination.droppableId) {
      return;
    }*/

      let finalArr = [];
      if (!result.destination) {
        return;
      }

      const items = this.reorder(
        list,
        result.source.index,
        result.destination.index
      );

      list = items;
      finalArr = items.map((obj, idx) => {
        return obj.id;
      });
      this.reOrderList(finalArr);
    };

    var onAddTextDragEnd = result => {
      let finalArr = [];
      if (!result.destination) {
        return;
      }

      const items = this.reorder(
        list,
        result.source.index,
        result.destination.index
      );

      list = items;
      finalArr = items.map((obj, idx) => {
        return obj.id;
      });
      //this.reOrderList(finalArr)
    };

    let editChoiceHtml = "",
      choicesHtml = "",
      choices = "";
    if (this.state.questionData !== undefined) {
      let edit_qData = this.state.questionData;
      let edit_qType = edit_qData.question_type;
      let edit_choices = edit_qData.question_choices;
      let edit_question = edit_qData.question;

      /// multitext edit question html
      if (this.state.edit_choices && edit_qType == "multitext") {
        choices = this.state.edit_choices.map((obj, idx) => {
          return {
            content: (
              <div
                className={
                  this.state["multiEditTextError_" + idx] === true
                    ? "choice-question-row field_error"
                    : "choice-question-row"
                }
                data-order_by="0"
                id="add_multiTextRow_0"
              >
                <a className="drag-dots" />
                <span className="choice-question-alpha">
                  {String.fromCharCode(65 + idx)}
                </span>
                <input
                  type="text"
                  className="setting-input-box add-questions"
                  name={"edit_text_" + idx}
                  value={this.state["edit_text_" + idx]}
                  autoComplete="off"
                  onChange={this.handleInputChange}
                />
                <a href="javascript:void(0)" className={(idx == 0) ? "choice-question-cross no-display" : "choice-question-cross"}>
                  <img
                    data-optionid={idx}
                    onClick={this.deleteEditTextOption.bind(this)}
                    src="/images/close.png"
                  />
                </a>
              </div>
            ),
            id: idx + 1
          };
        });
        choicesHtml = (
          <div className={this.state.div_edit_display_text}>
            <div className="col-lg-6 col-xs-12">
              <div className="settings-subtitle">
                {this.state.question_choices}
                <a
                  href="javascript:void(0)"
                  onClick={this.editMultiTextOption}
                  className="add-btn pull-right"
                >
                  <span>+</span>
                  {this.state.questionnaire_Add}
                </a>
              </div>
              <DragDropContext onDragEnd={onAddTextDragEnd}>
                <Droppable droppableId="droppable1" type="editChoiceText">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={this.getListStyle(snapshot.isDraggingOver)}
                    >
                      {choices.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                          type="editChoiceText"
                          isDragDisabled={(this.state.qId) ? false : true}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={this.getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                            >
                              {item.content}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
            <div className="col-lg-6 col-xs-12">
              <div className="row ques-radio-right">
                <div className="col-lg-7 col-md-12">
                  {this.state.select_yes}
                </div>
                <div className="col-lg-5 col-md-12">
                  <div className="basic-checkbox-outer">
                    <input
                      id="is_multiple_select_text_y"
                      className="basic-form-checkbox"
                      name={"edit_multiple_selection"}
                      type="radio"
                      value="1"
                      checked={
                        this.state.edit_multiple_selection == "1"
                          ? "checked"
                          : false
                      }
                      onChange={this.handleInputChange}
                    />
                    <label
                      className="basic-form-text"
                      htmlFor="is_multiple_select_text_y"
                    >
                      {this.state.yes_option}
                    </label>
                  </div>
                  <div className="basic-checkbox-outer">
                    <input
                      id="is_multiple_select_text_n"
                      className="basic-form-checkbox"
                      name={"edit_multiple_selection"}
                      type="radio"
                      value="0"
                      checked={
                        this.state.edit_multiple_selection == "0"
                          ? "checked"
                          : false
                      }
                      onChange={this.handleInputChange}
                    />
                    <label
                      className="basic-form-text"
                      htmlFor="is_multiple_select_text_n"
                    >
                      {this.state.no_option}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      } else if (this.state.edit_choices && edit_qType == "multiimage") {
        choices = this.state.edit_choices.map((obj, idx) => {
          return {
            content: (
              <div
                className="choice-question-outer ui-sortable"
                id="add_sortable_multi-images"
                key={"edit_image_" + idx}
              >
                <div className="choice-question-row no-border no-margin">
                    <div className="qus-chice-label col-xs-6 no-padding quest-img-title">{this.state.settings_question}</div>
                    <div className="qus-chice-label col-xs-6 no-padding quest-label-title">{this.state.questionnaire_Label}</div>
                </div>

                <div
                  className={
                    this.state["multiEditImageError_" + idx] === true
                      ? "choice-question-row field_error"
                      : "choice-question-row"
                  }
                >
                  <a className="drag-dots" />
                  <span className="choice-question-alpha">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="col-xs-6 no-padding dropzone-filename">
                    <div className="new-white-btn choose-file dz-clickable">
                      {this.state.Questionnaire_Choose_File}
                      <div className="dz-default dz-message">
                        <span>{this.state.editUsers_Drop_Files_To_Upload}</span>
                      </div>
                    </div>
                    <span className="span_dropzone_0">
                      {this.state["edit_image_" + idx]}
                    </span>
                    <input
                      type="file"
                      name={"edit_image_" + idx}
                      onChange={this.handleInputChange}
                      autoComplete="off"
                      className="image_questionnaire"
                    />
                  </div>
                  <input
                    type="text"
                    name={"edit_image_label_" + idx}
                    placeholder="label"
                    autoComplete="off"
                    onChange={this.handleInputChange}
                    className="col-xs-6 no-padding no-bg img-label"
                    value={this.state["edit_image_label_" + idx]}
                  />
                  <a
                    href="javascript:void(0)"
                    className={(idx == 0) ? "choice-question-cross no-display" : "choice-question-cross"}
                  >
                    <img
                      onClick={this.deleteEditImageOption.bind(this)}
                      src="/images/close.png"
                      data-optionid={idx}
                    />
                  </a>
                </div>
              </div>
            ),
            id: idx + 1
          };
        });

        choicesHtml = (
          <div className={this.state.div_edit_display_image}>
            <div className="col-lg-6 col-xs-12">
              <div className="settings-subtitle">
                {this.state.question_choices}
                <a
                  href="javascript:void(0)"
                  onClick={this.editMultiImageOption}
                  className="add-btn pull-right"
                >
                  <span>+</span>
                  {this.state.questionnaire_Add}
                </a>
              </div>
              <DragDropContext onDragEnd={onAddTextDragEnd}>
                <Droppable droppableId="droppable21">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={this.getListStyle(snapshot.isDraggingOver)}
                    >
                      {choices.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={"editChoiceText-" + item.id}
                          index={index}
                          isDragDisabled={(this.state.qId) ? false : true}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={this.getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                            >
                              {item.content}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            <div className="col-lg-6 col-xs-12">
              <div className="row ques-radio-right">
                <div className="col-lg-7 col-xs-12">
                  {this.state.select_yes}
                </div>
                <div className="col-lg-5 col-xs-12">
                  <div className="basic-checkbox-outer">
                    <input
                      id="is_multiple_select_image_y"
                      className="basic-form-checkbox"
                      name="edit_multiple_selection"
                      value="1"
                      type="radio"
                      checked={
                        this.state.edit_multiple_selection == "1"
                          ? "checked"
                          : false
                      }
                      onChange={this.handleInputChange}
                    />
                    <label
                      className="basic-form-text"
                      htmlFor="is_multiple_select_image_y"
                    >
                      {this.state.yes_option}
                    </label>
                  </div>
                  <div className="basic-checkbox-outer">
                    <input
                      id="is_multiple_select_image_n"
                      className="basic-form-checkbox"
                      name="edit_multiple_selection"
                      value="0"
                      type="radio"
                      checked={
                        this.state.edit_multiple_selection == "0"
                          ? "checked"
                          : false
                      }
                      onChange={this.handleInputChange}
                    />
                    <label
                      className="basic-form-text"
                      htmlFor="is_multiple_select_image_n"
                    >
                      {this.state.no_option}
                    </label>
                  </div>
                </div>
              </div>
              <div className="row ques-radio-right">
                <div className="col-lg-7 col-xs-12">
                  {this.state.select_yes_images}
                </div>
                <div className="col-lg-5 col-xs-12">
                  <div className="basic-checkbox-outer">
                    <input
                      id="is_multiple_select_labels_y"
                      className="basic-form-checkbox"
                      name="edit_display_labels"
                      value="1"
                      type="radio"
                      checked={
                        this.state.edit_display_labels == "1"
                          ? "checked"
                          : false
                      }
                      onChange={this.handleInputChange}
                    />
                    <label
                      className="basic-form-text"
                      htmlFor="is_multiple_select_labels_y"
                    >
                      {this.state.yes_option}
                    </label>
                  </div>
                  <div className="basic-checkbox-outer">
                    <input
                      id="is_multiple_select_labels_n"
                      className="basic-form-checkbox"
                      name="edit_display_labels"
                      value="0"
                      type="radio"
                      checked={
                        this.state.edit_display_labels == "0"
                          ? "checked"
                          : false
                      }
                      onChange={this.handleInputChange}
                    />
                    <label
                      className="basic-form-text"
                      htmlFor="is_multiple_select_labels_n"
                    >
                      {this.state.no_option}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      editChoiceHtml = (
        <div className="setting-container bg-light-blue addHere">
          <div className="setting-title m-b-40">
            {this.state.questionnaire_Edit_Question}
          </div>
          <div className="row">
            <div className="col-sm-6 col-xs-12">
              <div className="setting-field-outer no-ques-margin">
                <div className="new-field-label">
                  {this.state.questionnaire_Question}
                  <span className="setting-require">*</span>
                </div>
                <div className="setting-input-outer">
                  <input
                    type="text"
                    className="setting-input-box add-questions"
                    id="add_question"
                    name="edit_question"
                    autoComplete="off"
                    value={this.state.edit_question}
                    onChange={this.handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6 col-xs-12">
              <div className="setting-field-outer">
                <div className="new-field-label">
                  {this.state.question_type_data}
                  <span className="setting-require">*</span>
                </div>
                <div className="setting-input-outer">
                  <select
                    name="edit_question_type"
                    className="question_type setting-select-box"
                    value={this.state.edit_question_type}
                    onChange={this.handleInputChange}
                  >
                    <option value="yesno">
                      {this.state.yes_option}/{this.state.no_option}
                    </option>
                    <option value="multitext">
                      {this.state.questionnaire_Multiple_Selection_Text}
                    </option>
                    <option value="multiimage">
                      {this.state.questionnaire_Multiple_Selection_Images}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          {choicesHtml}
          <div className="col-xs-12">
            <a
              className="new-white-btn cancelAddAction"
              onClick={this.deleteEditRow.bind(this)}
            >
              {this.state.editUsers_CancelBtn}
            </a>
            <a
              id="save_newQuestion"
              onClick={this.updateQuestion}
              className="new-blue-btn"
            >
              {this.state.questionnaire_Update}
            </a>
          </div>
        </div>
      );
    }

    let list = [];
    if (this.state.itemArray.length) {
      list = this.state.itemArray.map((item, index) => {
        var question_type = item.question_type;
        let questionTypeLabel = "";

        if (question_type == "yesno") {
          questionTypeLabel = "Yes/No";
        } else if (question_type == "multitext") {
          questionTypeLabel = "Text";
        } else if (question_type == "multiimage") {
          questionTypeLabel = "Image";
        }
        return {
          content: (
            <React.Fragment key={"fragment_" + index}>
              <tr className="table-updated-tr">
                <td className="col-xs-8 table-updated-td Questionnaire-name">
                  <a className="drag-dots" />
                  {item.question}
                </td>
                <td className="col-xs-2 table-updated-td Questionnaire-name">
                  {questionTypeLabel}
                </td>
                <td className="col-xs-2 table-updated-td text-center ">
                  <a
                    className={
                      item.id
                        ? "easy-link col-xs-6 edit_question"
                        : "easy-link col-xs-6 edit_question no-display"
                    }
                    data-id={item.id}
                    onClick={this.editItem.bind(this)}
                  >
                    Edit
                  </a>
                  <a
                    className={
                      item.id
                        ? "easy-link col-xs-6 delete_question  no-display"
                        : "easy-link col-xs-6 delete_question"
                    }
                    data-id={index}
                    onClick={this.deleteItem.bind(this)}
                  >
                    Delete
                  </a>
                  <a
                    className={
                      item.id
                        ? "easy-link col-xs-6 delete_question"
                        : "easy-link col-xs-6 delete_question no-display"
                    }
                    data-id={item.id}
                    onClick={this.showDeleteModal.bind(this)}
                  >
                    Delete
                  </a>
                </td>
              </tr>
              {item.id == this.state.edit_question_id && (
                <tr className="table-updated-tr editQuestion_tr">
                  <td colSpan="3">{editChoiceHtml}</td>
                </tr>
              )}
            </React.Fragment>
          ),
          id: item.id ? item.id : index
        };
      });
    }

    let cList = [];
    if (this.state.multiTextArr.length) {
      cList = this.state.multiTextArr.map((divItem, index) => {
        return {
          content: (
            <div
              className={
                this.state["multiTextError_" + index] === true
                  ? "choice-question-row field_error"
                  : "choice-question-row"
              }
              key={"text_" + index}
            >
              <a className="drag-dots" />
              <span className="choice-question-alpha">
                {String.fromCharCode(65 + index)}
              </span>
              <input
                type="text"
                className="setting-input-box add-questions"
                data-row-num="0"
                onChange={this.handleInputChange}
                name={"text_" + index}
                autoComplete="off"
                value={
                  this.state["text_" + index] ? this.state["text_" + index] : ""
                }
              />
              <a href="javascript:void(0)"
              className={(index == 0) ? "choice-question-cross no-display" : "choice-question-cross"}
              >
                <img
                  src="/images/close.png"
                  data-optionid={index}
                  onClick={this.deleteTextOption.bind(this)}
                />
              </a>
            </div>
          ),
          id: "addTextChoice-" + index
        };
      });
    }

    return (
      <div className="main protected">
        <div id="content">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />

            <div className="setting-setion m-b-60">
              <div className="setting-container bg-white-scetion">
                <div className="setting-title m-b-40">
                {this.state.qId  ? this.state.settings_view_questionnaire : this.state.add_questionnaire}
                  <Link to="/settings/questionnaires" className="pull-right cancelAction">
                    <img src="/images/close.png" />
                  </Link>
                </div>

                <div className="row">
                  <div className="col-lg-6">
                    <div className="setting-field-outer no-ques-margin questionId:this.state.idn">
                      <div className="new-field-label">
                        {this.state.questionnaire_name}
                        <span className="setting-require">*</span>
                      </div>
                      <div className="setting-input-outer">
                        <input
                          name="consultation_title"
                          onChange={this.handleInputChange}
                          className={
                            this.state.consultation_title_Error === true
                              ? "setting-input-box field_error"
                              : "setting-input-box"
                          }
                          id="consultation_title"
                          value={this.state.consultation_title}
                          type="text"
                          autoComplete="off"
                        />{" "}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="setting-container bg-light-blue addHere">
                <div className="setting-title m-b-40">
                  {this.state.add_new_question}
                </div>

                <div className="row">
                  <div className="col-sm-6">
                    <div className="setting-field-outer no-ques-margin">
                      <div className="new-field-label">
                        {this.state.question_data}
                        <span className="setting-require">*</span>
                      </div>
                      <div className="setting-input-outer">
                        <input
                          type="text"
                          className={
                            this.state.question_Error === true
                              ? "setting-input-box add-questions field_error"
                              : "setting-input-box add-questions"
                          }
                          onChange={this.handleInputChange}
                          value={this.state.question}
                          id="add_question"
                          name="question"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6">
                    <div className="setting-field-outer">
                      <div className="new-field-label">
                        {this.state.question_type_data}
                        <span className="setting-require">*</span>
                      </div>
                      <div className="setting-input-outer">
                        <select
                          name="question_type"
                          className="question_type setting-select-box"
                          value={this.state.question_type}
                          onChange={this.handleInputChange}
                        >
                          <option value="yesno">
                            {this.state.yes_option}/{this.state.no_option}
                          </option>
                          <option value="multitext">
                            {this.state.questionnaire_Multiple_Selection_Text}
                          </option>
                          <option value="multiimage">
                            {this.state.questionnaire_Multiple_Selection_Images}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className={this.state.div_display_text}>
                    <div className="col-lg-6 col-xs-12">
                      <div className="settings-subtitle">
                        {this.state.question_choices}
                        <a
                          onClick={this.addMultiTextOption}
                          href="javascript:void(0)"
                          className="add-btn pull-right"
                        >
                          <span>+</span> {this.state.questionnaire_Add}
                        </a>
                      </div>
                      <div
                        className="choice-question-outer ui-sortable"
                        id="add_sortable_multi-text"
                      >
                        <DragDropContext onDragEnd={onAddTextDragEnd}>
                          <Droppable droppableId="droppable2">
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                style={this.getListStyle(
                                  snapshot.isDraggingOver
                                )}
                              >
                                {cList.map((item, index) => (
                                  <Draggable
                                    key={item.id}
                                    draggableId={"test-" + item.id}
                                    index={index}
                                    isDragDisabled={true}
                                  >
                                     {/* isDragDisabled={(this.state.qId) ? false : true} */}
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={this.getItemStyle(
                                          snapshot.isDragging,
                                          provided.draggableProps.style
                                        )}
                                      >
                                        {item.content}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </div>
                    </div>

                    <div className="col-lg-6 col-xs-12">
                      <div className="row ques-radio-right">
                        <div className="col-lg-7 col-md-12">
                          {this.state.select_yes}
                        </div>
                        <div className="col-lg-5 col-md-12">
                          <div className="basic-checkbox-outer">
                            <input
                              id="is_multiple_select_text_y"
                              className="basic-form-checkbox"
                              name="multiple_selection"
                              onChange={this.handleInputChange}
                              type="radio"
                              value={1}
                              checked={
                                this.state.multiple_selection == "1"
                                  ? "checked"
                                  : false
                              }
                            />
                            <label
                              className="basic-form-text"
                              htmlFor="is_multiple_select_text_y"
                            >
                              {this.state.yes_option}
                            </label>
                          </div>
                          <div className="basic-checkbox-outer">
                            <input
                              id="is_multiple_select_text_n"
                              className="basic-form-checkbox"
                              name="multiple_selection"
                              type="radio"
                              onChange={this.handleInputChange}
                              value={0}
                              checked={
                                this.state.multiple_selection == "0"
                                  ? "checked"
                                  : false
                              }
                            />
                            <label
                              className="basic-formultitextm-text"
                              htmlFor="is_multiple_select_text_n"
                            >
                              {this.state.no_option}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={this.state.div_display_image}>
                    <div className="col-lg-6 col-xs-12">
                      <div className="settings-subtitle">
                        {this.state.question_choices}
                        <a
                          href="javascript:void(0)"
                          onClick={this.addMultiImageOption}
                          className="add-btn pull-right"
                        >
                          <span>+</span>{" "}
                          {this.state.questionnaire_Add}
                        </a>
                      </div>
                      <div
                        className="choice-question-outer ui-sortable"
                        id="add_sortable_multi-images"
                      >
                        <div className="choice-question-row no-border no-margin">
                          <div className="qus-chice-label col-xs-6 no-padding quest-img-title">
                            {this.state.question_choices_image}
                          </div>
                          <div className="qus-chice-label col-xs-6 no-padding quest-label-title">
                            {this.state.question_choice_lable}
                          </div>
                        </div>

                        {this.state.multiImageArr.map((divItem, index) => {
                          let imageName = this.state["image_" + index];
                          if (!imageName) {
                            imageName = this.state.questionnaire_No_file;
                          }
                          return (
                            <div
                              key={"image_" + index}
                              className={
                                this.state["multiImageError_" + index] === true
                                  ? "choice-question-row field_error"
                                  : "choice-question-row"
                              }
                              key={"image_" + index}
                              data-order_by="0"
                              id="add_multiImageRow_0"
                            >
                              <a className="drag-dots" />
                              <span className="choice-question-alpha">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <div className="col-xs-6 no-padding dropzone-filename">
                                <div className="new-white-btn choose-file">
                                  Choose file
                                  <div className="dz-default dz-message">
                                    <span>Drop files here to upload</span>
                                  </div>
                                </div>
                                <span className="span_dropzone_0">
                                  {imageName}
                                </span>
                                <input
                                  type="file"
                                  name={"image_" + index}
                                  disabled={this.state.isDisabled}
                                  onChange={this.handleInputChange}
                                  className="image_questionnaire"
                                />
                                <div className="dz-default dz-message">
                                  <span>
                                    {this.state.editUsers_Drop_Files_To_Upload}
                                  </span>
                                </div>
                              </div>
                              {/*<span className="span_dropzone_0"> No file</span>*/}
                              <input
                                disabled={this.state.isDisabled}
                                type="hidden"
                                id="dropzone_0"
                                data-row-num="0"
                                className="add-questions"
                              />
                              <input
                                disabled={this.state.isDisabled}
                                type="text"
                                name={"image_label_" + index}
                                onChange={this.handleInputChange}
                                value={this.state["image_label_" + index]}
                                id="img_label_0"
                                placeholder="label"
                                className="col-xs-6 no-padding no-bg img-label"
                              />
                              <a
                                href="javascript:void(0)"
                                data-optionid={index}
                                onClick={this.deleteImageOption.bind(this)}
                                className={(index == 0) ? "choice-question-cross no-display" : "choice-question-cross"}
                              >
                                <img src="/images/close.png" data-optionid={index} />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="col-lg-6 col-xs-12">
                      <div className="row ques-radio-right">
                        <div className="col-lg-7 col-md-12">
                          {this.state.select_yes}
                        </div>
                        <div className="col-lg-5 col-md-12">
                          <div className="basic-checkbox-outer">
                            <input
                              disabled={this.state.isDisabled}
                              id="is_multiple_select_image_y"
                              className="basic-form-checkbox"
                              name="multiple_selection_image"
                              onChange={this.handleInputChange}
                              value={"1"}
                              type="radio"
                              checked={
                                this.state.multiple_selection_image == "1"
                                  ? "checked"
                                  : false
                              }
                            />
                            <label
                              className="basic-form-text"
                              htmlFor="is_multiple_select_image_y"
                            >
                              {this.state.yes_option}
                            </label>
                          </div>
                          <div className="basic-checkbox-outer">
                            <input
                              disabled={this.state.isDisabled}
                              id="is_multiple_select_image_n"
                              className="basic-form-checkbox"
                              name="multiple_selection_image"
                              onChange={this.handleInputChange}
                              value={"0"}
                              type="radio"
                              checked={
                                this.state.multiple_selection_image == "0"
                                  ? "checked"
                                  : false
                              }
                            />
                            <label
                              className="basic-form-text"
                              htmlFor="is_multiple_select_image_n"
                            >
                              {this.state.no_option}
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="row ques-radio-right">
                        <div className="col-lg-7 col-md-12">
                          {this.state.select_yes_images}
                        </div>
                        <div className="col-lg-5 col-md-12">
                          <div className="basic-checkbox-outer">
                            <input
                              id="is_multiple_select_labels_y"
                              className="basic-form-checkbox"
                              name="display_labels"
                              onChange={this.handleInputChange}
                              value={1}
                              type="radio"
                              checked={
                                this.state.display_labels == "1"
                                  ? "checked"
                                  : false
                              }
                            />
                            <label
                              className="basic-form-text"
                              htmlFor="is_multiple_select_labels_y"
                            >
                              {this.state.yes_option}
                            </label>
                          </div>
                          <div className="basic-checkbox-outer">
                            <input
                              id="is_multiple_select_labels_n"
                              className="basic-form-checkbox"
                              name="display_labels"
                              onChange={this.handleInputChange}
                              value={0}
                              type="radio"
                              checked={
                                this.state.display_labels == "0"
                                  ? "checked"
                                  : false
                              }
                            />
                            <label
                              className="basic-form-text"
                              htmlFor="is_multiple_select_labels_n"
                            >
                              {this.state.no_option}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xs-12">
                    <a
                      className="new-white-btn cancelAddAction"
                      onClick={this.cancelQuestion}
                    >
                      {this.state.editUsers_CancelBtn}
                    </a>
                    <button
                      id="save_newQuestion"
                      onClick={this.createProject}
                      className="new-blue-btn"
                    >
                      {this.state.questionnaire_Add}
                    </button>
                  </div>
                </div>
              </div>
              {list.length > 0 && (
                <div className="table-responsive">
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable3">
                      {(provided, snapshot) => (
                        <table
                          className="table-updated no-hover setting-table table-min-width"
                          ref={provided.innerRef}
                        >
                          <thead className="table-updated-thead">
                            <tr>
                              <th className="col-xs-8 table-updated-th sorting">
                                {this.state.questionnaire_Questions}
                              </th>
                              <th className="col-xs-2 table-updated-th sorting text-center">
                                Type
                              </th>
                              <th className="col-xs-2 table-updated-th sorting text-center">
                                &nbsp;
                              </th>
                            </tr>
                          </thead>
                          {list.map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={"newAns-" + item.id}
                              index={index}
                              isDragDisabled={(this.state.qId) ? false : true}
                            >
                              {(provided, snapshot) => (
                                <tbody
                                  id="questionList"
                                  className="ui-sortable"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={this.getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                  )}
                                >
                                  {item.content}
                                </tbody>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </table>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              )}
              <div className="footer-static no-border">
                <a
                  className={
                    this.state.qId != undefined
                      ? "new-red-btn pull-left confirm-model"
                      : "no-display"
                  }
                  onClick={this.showQuestionnaireDeleteModal}
                >
                  Delete
                </a>
                <button
                  id="saveConsultation"
                  onClick={this.handleSubmit}
                  className="new-blue-btn pull-right"
                >
                  Save
                </button>
                <Link
                  to="/settings/questionnaires"
                  className="new-white-btn pull-right cancelAction"
                >
                  Cancel
                </Link>
              </div>
              <div
                className={
                  this.state.showLoader
                    ? "new-loader text-left displayBlock"
                    : "new-loader text-left"
                }
              >
                <div className="loader-outer">
                  <img
                    id="loader-outer"
                    src="/images/Eclipse.gif"
                    className="loader-img"
                  />
                  <div id="modal-confirm-text" className="popup-subtitle">
                    {this.state.clinic_Please_Wait}
                  </div>
                </div>
              </div>
              <div className={this.state.showModal ? "overlay" : ""} />
              <div
                id="filterModal"
                role="dialog"
                className={
                  this.state.showModal
                    ? "modal fade in displayBlock"
                    : "modal fade"
                }
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button
                        type="button"
                        className="close"
                        data-dismiss="modal"
                        onClick={this.dismissModal}
                      >
                        ×
                      </button>
                      <h4 className="modal-title" id="model_title">
                        {this.state.delete_confirmation}
                        {this.state.showModal}
                      </h4>
                    </div>
                    <div
                      id="errorwindow"
                      className="modal-body add-patient-form filter-patient"
                    >
                      {this.state.delete_warning}
                    </div>
                    <div className="modal-footer">
                      <div className="col-md-12 text-left" id="footer-btn">
                        <button
                          type="button"
                          className="btn  logout pull-right"
                          data-dismiss="modal"
                          onClick={this.dismissModal}
                        >
                          {this.state.no_option}
                        </button>
                        <button
                          type="button"
                          className="btn btn-success pull-right m-r-10"
                          data-dismiss="modal"
                          onClick={this.deleteQuestion}
                        >
                          {this.state.yes_option}
                        </button>

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
  const languageData = JSON.parse(localStorage.getItem("languageData"));
  const returnState = {};
  toast.dismiss();
  if (state.SettingReducer.action === "CREATE_QUESTIONNAIRES") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = true;
      returnState.showLoaderTimestamp = new Date();
    }
    else {
      returnState.message = languageData.global[state.SettingReducer.data.message];
      returnState.redirect = true;
      returnState.redirectTimestamp = new Date();
    }
  } else if (state.SettingReducer.action === "UPDATE_QUESTIONNAIRES") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = true
      returnState.showLoaderTimestamp = new Date();
    }
    else {
      returnState.message =
      languageData.global[state.SettingReducer.data.message];
      returnState.redirect = true;
      returnState.redirectTimestamp = new Date();
    }
  } else if (state.SettingReducer.action === "CREATE_QUESTION") {
    if (state.SettingReducer.data.status != 201) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = true
      returnState.showLoaderTimestamp = new Date();
    }
    else {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      returnState.questionnaireData = state.SettingReducer.data;
      returnState.questionnaireDataTimeStamp = new Date();
    }
  } else if (state.SettingReducer.action === "UPDATE_QUESTION") {
    if (state.SettingReducer.data.status != 200)
    {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = true
      returnState.showLoaderTimestamp = new Date();
    }
    else {
      toast.dismiss();
      toast.success(languageData.global[state.SettingReducer.data.message]);
     returnState.questionnaireData = state.SettingReducer.data;
     returnState.questionnaireDataTimeStamp = new Date();
   }
  }
  else if (state.SettingReducer.action === "GET_QUESTIONNAIRE") {
    if (state.SettingReducer.data.status != 200) {
      returnState.redirect = true;
      returnState.redirectTimestamp = new Date();
      returnState.message =
        languageData.global[state.SettingReducer.data.message];
        returnState.showLoader = true
        returnState.showLoaderTimestamp = new Date();
    }
    else
    {
      returnState.questionnaireData = state.SettingReducer.data;
      returnState.questionnaireDataTimeStamp = new Date();
    }
  } else if (state.SettingReducer.action === "GET_QUESTION") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = true
      returnState.showLoaderTimestamp = new Date();
    }
    else {
     returnState.questionData = state.SettingReducer.data;
     returnState.questionDataTimeStamp = new Date();
   }
  } else if (state.SettingReducer.action === "QUESTION_DELETED") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = true
      returnState.showLoaderTimestamp = new Date();
    }
    else {
          toast.success(languageData.global[state.SettingReducer.data.message]);
          returnState.questionnaireData = state.SettingReducer.data;
          returnState.questionnaireDataTimeStamp = new Date();
        }
  } else if (state.SettingReducer.action === "QUESTIONNAIRE_DELETED") {
    if (state.SettingReducer.data.status != 200)
    {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = true
      returnState.showLoaderTimestamp = new Date();
    }
    else
    {
      returnState.redirect = true;
      returnState.redirectTimestamp = new Date();
      returnState.message =
        languageData.global[state.SettingReducer.data.message];
    }
  }
  if (state.SettingReducer.action === "SORT_ORDER_UPDATE") {
    if (state.SettingReducer.data.status != 200){
      toast.dismiss()
      toast.error(languageData.global[state.SettingReducer.data.message]);
      //returnState.showLoader = true
    }
    else  {
      toast.dismiss()
      toast.success(languageData.global[state.SettingReducer.data.message]);
      //return { showLoader: false };
    }
  }
  else if (state.CommonReducer.action === "GET_TRACK_HEAP_EVENT") {
    if(state.CommonReducer.data.status != 201){
       //returnState.message = languageData.global[state.CommonReducer.data.message];
     }
    }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createQuestionnaire: createQuestionnaire,
      createQuestion: createQuestion,
      uploadImage: uploadImage,
      getQuestionnaireById: getQuestionnaireById,
      getQuestionById: getQuestionById,
      updateQuestion: updateQuestion,
      deleteQuestion: deleteQuestion,
      deleteQuestionnaire: deleteQuestionnaire,
      updateQuestionnaire: updateQuestionnaire,
      updateSortOrder: updateSortOrder,
      exportEmptyData: exportEmptyData,
      geCommonTrackEvent: geCommonTrackEvent
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateQuestionnaries);
