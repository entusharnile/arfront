import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import {  updateSortOrder } from "../../../../Actions/Settings/settingsActions.js";
import {  displayName } from "../../../../Utils/services.js";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ToastContainer, toast } from "react-toastify";
import axios from 'axios';

class DragAndDrop extends React.Component {
  constructor(props) {
      super(props);
  }

  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: "none",
    background: isDragging ? "#f7fbfd" : "ffffff",
    ...draggableStyle
  });

  reOrderList = list => {
    let formData = {
      object_ids: list
    };
    this.props.updateSortOrder(formData, this.props.module);
  };

  onEdit = (id, url) => {
    this.props.editUrl(id);
  };

  render() {
    var list = [];
    if (this.props.list !== undefined) {
      let name = '';
      let desc = '';
      let extraDesc1 = '';
      let extraDesc2 = '';
      if(this.props.module === 'Consent'){
        name = 'consent_name';
        desc = 'added_by';
      }
      else if(this.props.module === 'ConsultationList'){
        name = 'consultation_title';
        desc = 'questions_count';
      }
      else if(this.props.module === 'PreTreatmentInstruction'){
        name = 'title';
        desc = 'added_by_user';
        extraDesc1 = 'firstname';
        extraDesc2 = 'lastname';
      }
      else if(this.props.module === 'PostTreatmentInstruction' || this.props.module === 'ProcedureTemplate'){
        name = 'title';
        desc = 'added_by_user';
        extraDesc1 = 'firstname';
        extraDesc2 = 'lastname';
      }

      list = this.props.list.map((obj, idx) => {
        let finalDesc = '';
        if (obj[desc] && extraDesc1 !== ''){
          finalDesc = obj[desc][extraDesc1];
        }
        if (obj[desc] && extraDesc2 !== ''){
          finalDesc += ' '+obj[desc][extraDesc2];
        }

        if(extraDesc1 === '' && extraDesc2 === ''){
          finalDesc = obj[desc];
        }

        if(obj[desc] == undefined) {
          finalDesc = displayName(obj)
        }
        return {
          content: (
            <React.Fragment key={'fragment_'+idx}>
              <td className="col-xs-8 table-updated-td Questionnaire-name">
                <a href="#" className="drag-dots" />
                {obj[name]}
              </td>
              <td className="col-xs-4 table-updated-td text-center">
                {finalDesc}
              </td>
            </React.Fragment>
          ),
          id: obj.id
        };
      });
    }

    var onDragEnd = result => {
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
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <tbody className="table-updated setting-table" ref={provided.innerRef}>
              {list.map((item, index)=>(
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot)=>(
                    <tr className="table-updated-tr"  data-order_by={item.id}  onClick={this.onEdit.bind(this, item.id)} ref={provided.innerRef}{...provided.draggableProps}{...provided.dragHandleProps} style={this.getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
                    {item.content}
                    </tr>)}
                </Draggable>))
              }
              {null}{provided.placeholder}
            </tbody>)}
        </Droppable>
      </DragDropContext>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem("languageData"));
  const returnState = {};
   if (state.SettingReducer.action === "SORT_ORDER_UPDATE") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    }
    else
    {
      toast.success(languageData.global[state.SettingReducer.data.message]);
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {  updateSortOrder: updateSortOrder },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DragAndDrop);
