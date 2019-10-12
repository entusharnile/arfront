import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DropzoneComponent from 'react-dropzone-component';
import EXIF from "exif-js";
import config from '../../config';
import {getToken} from '../../Utils/services.js';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import { connect } from 'react-redux';

window.EXIF = EXIF;
class FileUploader extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            defImageCls        : 'no-display',
            cameraInPreviewCls : 'camra-icon dz-clickable no-image',
            uploadedFile       : '',
            dzImgObj           : this.props.dzImgObj,
            logo_url           : '',
            dzCSS              : '',
        }
        this.componentConfig = {
          //  iconFiletypes: ['.jpg', '.png', '.gif'],
            showFiletypeIcon    : true,
            postUrl             : config.API_URL + `media/upload?upload_type=` + this.props.type,
            uploadType          : this.props.type
          };

        this.djsConfig = {
            addRemoveLinks      : true,
            autoProcessQueue    : true,
            acceptedFiles       : "image/jpeg,image/png,image/gif",
            clickable           : '.camra-icon',
            method              : 'POST',
            headers             : {'access-token'  : getToken()}
          };

        this.callback = (file) => {
            if (file.type != "image/png" && file.type != "image/jpg" && file.type != "image/jpeg" && file.type != "image/gif") {
              toast.error('This file type is not allowed!');
            } else {
                this.props.handleChildChange({defImageCls: 'no-display', cameraInPreviewCls: 'camra-icon dz-clickable camera-in-preview', dzImgObj: file, dzCSS: ''})
            }
        };

        this.success = file => {
            const languageData = JSON.parse(localStorage.getItem('languageData'))
            let response = JSON.parse(file.xhr.response);

            toast.dismiss();

            if ( response.status == "200" ) {
              this.props.handleChildChange({uploadedFile: response.data.file_name, dzImgObj: file, [this.props.uploadedFileName] : response.data.file_name})
            } else {
                toast.error(languageData.global[response.message]);
            }
          }

          this.removedfile = file => {
            this.props.handleChildChange({[this.props.uploadedFileName]: ''});
          }

          this.dropzone = null;
    }

    reInit = (reInitData) => {
        this.dropzone.removeFile(reInitData.dzImgObj)
        this.dropzone.options.addedfile.call(this.dropzone, reInitData.mockFile);
        this.dropzone.options.thumbnail.call(this.dropzone, reInitData.mockFile, reInitData[this.props.fileUrl]);
        this.dropzone.emit("complete", reInitData.mockFile);
        if ( this.props[this.props.fileUrl] == "" ) {
            this.props.handleChildChange({[this.props.uploadedFileName]: ''});
        } else {
            this.props.handleChildChange({[this.props.uploadedFileName] : reInitData[this.props.uploadedFileName]});
        }
    }

    render() {
        let config    = this.componentConfig;
        let djsConfig = this.djsConfig;
        let mockFile    = {name:this.props[this.props.fileUrl], accepted: true, size: 7627};
        let logo = '',
          defImageCls = '',
          cameraInPreviewCls = '',
          dzCSS = '';

        if (  this.props[this.props.uploadedFileName] == '' || this.props[this.props.uploadedFileName] == null) {
              logo = '';
              defImageCls = '';
              cameraInPreviewCls = 'camra-icon dz-clickable no-image';
              dzCSS = 'no-dz-image';
        } else {
              defImageCls = 'no-display';
              cameraInPreviewCls = 'camra-icon dz-clickable camera-in-preview';
              dzCSS = '';
        }

        let eventHandlers = {
            init        : dz =>  {
                this.dropzone = dz;
                dz.options.addedfile.call(dz, mockFile);
                dz.options.thumbnail.call(dz, mockFile, this.props[this.props.fileUrl]);
                dz.emit("complete", mockFile);


            },
            //drop: this.callbackArray,
            addedfile   : this.callback,
            success     : this.success,
            removedfile : this.removedfile
        }
        return (
            <div className={this.props.containerClass}>
               <img className={defImageCls} src={this.props.defLogo}/>
               <div className={cameraInPreviewCls}><i className="fas fa-camera"></i></div>
               <DropzoneComponent config={config} eventHandlers={eventHandlers} djsConfig={djsConfig} className={dzCSS}/>
             </div>
            )
        }
}

export default FileUploader;
