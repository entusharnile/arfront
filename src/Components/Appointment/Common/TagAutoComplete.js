import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'
import Autosuggest from 'react-autosuggest'


const selectedTagId = (validTagList, selectedTagName) =>{
  let tagId = [];
  if(selectedTagName.length > 0){
    validTagList.map((obj, idx) => {
      if(selectedTagName.indexOf(obj.name) != -1){
        tagId.push(obj.id);
      }
    });
  }
  return tagId;
}

class TagAutoComplete extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputClassName : (this.props.inputClassName) ?  this.props.inputClassName : 'react-tagsinput-input',
            validTagList:this.props.validTagList,
            validTagListUpdated: this.props.validTagListUpdated,
            selectedTag : this.props.selectedTag,
            selectedId : [],
            isFocus:false,
        }
    }
    static getDerivedStateFromProps(props, state) {
      let returnState = {}
      if(props.showLoader != undefined && props.showLoader == false) {
          return {showLoader : false};
       }
      if(props.validTagListUpdated != state.validTagListUpdated){
        returnState.validTagListUpdated = props.validTagListUpdated;
        returnState.validTagList = props.validTagList;
        returnState.selectedTag = props.selectedTag;
        returnState.selectedId = selectedTagId(props.validTagList,props.selectedTag);
        returnState.inputClassName = props.inputClassName;
        props.handleChildChange({[props.listName] : {
          selectedTag : returnState.selectedTag,
          validTagList : returnState.validTagList,
          validTagListUpdated : returnState.validTagListUpdated,
          selectedId : returnState.selectedId
        }
      });
      } else if(props.inputClassName != state.inputClassName){
        returnState.inputClassName = props.inputClassName;
      } else if(props.selectedTag != state.selectedTag){
        returnState.selectedTag = props.selectedTag;
        returnState.selectedId = selectedTagId(state.validTagList,props.selectedTag);
        props.handleChildChange({[props.listName] : {
          selectedTag : returnState.selectedTag,
          validTagList : state.validTagList,
          validTagListUpdated : state.validTagListUpdated,
          selectedId : returnState.selectedId
        }
      });
      }
      return returnState;
    }

    handleTagChange = (selectedTag) => {
      this.setState({isFocus:true})
      let lastTag = selectedTag[selectedTag.length - 1];
      // Update selected tag and existing tags list
      let listData = {
        selectedTag : this.state.selectedTag,
        validTagList : this.state.validTagList,
        validTagListUpdated : this.state.validTagListUpdated,
        selectedId : [],
      }
      if(lastTag){
        let isValidTag = false;
        this.state.validTagList.map((obj, idx) => {
          if(obj.name != undefined && typeof obj.name  == "string" && obj.name.toLowerCase() == lastTag.toLowerCase()){
            isValidTag = true;
          }
        });
        if(isValidTag){
          listData['selectedTag'] = selectedTag;
          let validTagListUpdated = [];
          this.state.validTagList.map((obj, idx) => {
            if(selectedTag.indexOf(obj.name) == -1){
              validTagListUpdated.push(obj);
            }
          });
          listData['validTagListUpdated'] = validTagListUpdated;
        }
      } else {
        listData['validTagListUpdated'] = this.state.validTagList;
        listData['selectedTag'] = selectedTag;
      }
      listData['validTagList'] = this.state.validTagList;
      listData['selectedId'] = selectedTagId(listData['validTagList'],listData['selectedTag']);
      /*
        if(listData['selectedTag'].length > 0){
        listData['validTagList'].map((obj, idx) => {
          if(listData['selectedTag'].indexOf(obj.name) != -1){
            listData['selectedId'].push(obj.id);
          }
        });
      }
      */
      this.props.handleChildChange({[this.props.listName] : listData});
    }

    onBlur = () => {
      this.setState({isFocus:false})
    }



    render() {
      let validTagListUpdated = this.state.validTagListUpdated;
      let listName = this.props.listName;
      let isFocus = this.state.isFocus
      function onBlur(event, { highlightedSuggestion }) {
        event.preventDefault();
        isFocus = false
      }
      function autosuggestRenderInput ({addTag, ...props}) {
         const handleOnChange = (e, {newValue, method}) => {
           if (method === 'enter') {
             e.preventDefault()
           } else if (method === 'down') {
             e.preventDefault()
           } else if (method === 'up') {
             e.preventDefault()
           } else {
             props.onChange(e)
           }
         }

         const inputValue = (props.value  && props.value.trim().toLowerCase()) || ""
         const inputLength = inputValue.length
         let suggestions = validTagListUpdated.filter((validTag) => {
           if(validTag.name != undefined && typeof validTag.name == 'string'){
             return validTag.name.toLowerCase().slice(0, inputLength) === inputValue
           }
         })

         return (
           <Autosuggest
             ref={props.ref}
             suggestions={suggestions}
             focusInputOnSuggestionClick={true}
             highlightFirstSuggestion={true}
             shouldRenderSuggestions={(value) => true}
             getSuggestionValue={(suggestion) => suggestion.name}
             renderSuggestion={(suggestion) => <span>{suggestion.name}</span>}
             inputProps={{...props, onChange: handleOnChange, onBlur:onBlur}}
             onSuggestionSelected={(e, {suggestion}) => {
               addTag(suggestion.name)
             }}
             alwaysRenderSuggestions={false}
             onSuggestionsClearRequested={() => {}}
             onSuggestionsFetchRequested={() => {}}
           />
         )
       }

        return (
            <TagsInput onlyUnique={true} inputProps={{className: this.state.inputClassName, placeholder: ''}} renderInput={autosuggestRenderInput} value={this.state.selectedTag} onChange={this.handleTagChange}   />
            )

        }
}

export default TagAutoComplete;
