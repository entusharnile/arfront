import React, { Component } from 'react';
import Select from "react-select";

const getSelectedId = (selectedoptions) =>{
  let selectedId = [];
  if(selectedoptions.length > 0){
    selectedoptions.map((obj, idx) => {
      selectedId.push(obj.value)
    });
  }
  return selectedId;
}

class TagAutoSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          //inputClassName : (this.props.inputClassName) ?  this.props.inputClassName : 'setting-input-box',
          inputClassName : (this.props.inputClassName) ?  ((this.props.inputClassName.includes('field_error')) ? 'field_error' : '') : '', //'setting-input-box',
          options:this.props.options,
          value: this.props.value,
          selectedId : (this.props.value !== undefined ) ? getSelectedId(this.props.value) : [],
          isFocus:false,
          placeholder: (this.props.placeholder !== undefined ) ? this.props.placeholder : ''
        }
    }
    static getDerivedStateFromProps(props, state) {
      let returnState = {}
      if(props.showLoader != undefined && props.showLoader == false) {
          return {showLoader : false};
       }
      if(props.value != state.value){
        returnState.value = props.value;
        returnState.options = props.options;
        returnState.selectedTag = props.selectedTag;
        returnState.selectedId = getSelectedId(props.value);
        returnState.inputClassName = (props.inputClassName.includes('field_error')) ? 'field_error' :' '
        props.handleChildChange({[props.listName] : {
            options : returnState.options,
            value : returnState.value,
            selectedId : returnState.selectedId
          }
        });
      } else if(props.inputClassName != state.inputClassName){
        returnState.inputClassName = (props.inputClassName.includes('field_error')) ? 'field_error' :' '

      }
      return returnState;
    }

    handleTagChange = (selectedOption, x) => {
      console.log(selectedOption, x);
      if (x.action == "select-option") {
        let listData = {}
        if(x.option.value !== 'addnewcat'){     
            let value = this.state.value;
            const options = this.state.options;
            value.push(x.option);
            const selectedId = getSelectedId(value);
             this.setState({
               value: value,
               selectedId: selectedId
             });
            listData = {
              options : this.state.options,
              value : value,
              selectedId : selectedId,
            }
          }
        this.props.handleChildChange({[this.props.listName] : listData}, x.option.value);
      }  else if (x.action == "remove-value") {
        let value = this.state.value;
        let index = value.findIndex(y => y.value === x.removedValue.value);
        value.splice(index, 1);
        const selectedId = getSelectedId(value);
        this.setState({
          value: value,
          selectedId:selectedId
        });
        let listData = {
          options : this.state.options,
          value : value,
          selectedId : selectedId,
        }
        this.props.handleChildChange({[this.props.listName] : listData});
      } else if (x.action == "clear") {
        this.setState({
          value: [],
          selectedId:[]
        });
        let listData = {
          options : this.state.options,
          value : [],
          selectedId : [],
        }
        this.props.handleChildChange({[this.props.listName] : listData});
      }
    }


    render() {
        let value = []
        if(this.state.value !== undefined){
          value = this.state.value.map((obj, lidx) => {
            return obj
          })
        }
        return (
          <div className="tag-auto-select" >
          {this.state.value && <Select
            placeholder={this.state.placeholder}
            onChange={this.handleTagChange}
            value={value}
            isClearable
            isSearchable
            options={this.props.options}
            isMulti={true}
            className={this.state.inputClassName}
            name = "clinicList"
          />}

            </div>
            )

        }
}

export default TagAutoSelect;
