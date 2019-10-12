import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { ToastContainer, toast } from "react-toastify";
import {getAfterPhotos} from '../../Actions/Clients/clientsAction.js'
import { displayName } from '../../Utils/services.js';
import defVImage from '../../images/no-image-vertical.png';
import picClose from '../../images/close.png';


class AfterPhotos extends Component {
  constructor(props) {
    super(props);

    const languageData  = JSON.parse(localStorage.getItem('languageData'))

    this.state = {
      backURLType           : this.props.match.url.split('/')[1],
      action                : (this.props.match.params.type) ? this.props.match.params.type : 'profile',
      showLoader            : false,
      procedureID           : this.props.match.params.procedureID,
      globalLang            : languageData.global,
      def_no_image_vertical : defVImage,
    }
  }

  componentDidMount() {
    this.setState({
      showLoader: true
    });

    this.props.getAfterPhotos(this.state.procedureID);
  }

  static getDerivedStateFromProps(props, state) {
    if ( props.afterImageData !== undefined && props.afterImageData.status === 200 && props.afterImageData.data !== state.afterImageData ) {
       return {
         afterImageData   : props.afterImageData.data,
         showLoader       : false,
       }

     } else if ( props.afterImageData !== undefined && props.afterImageData.status !== 200 && props.afterImageData.data !== state.afterImageData ) {
       return {
         afterImageData   : props.afterImageData.data,
         showLoader       : false,
       }
     }

    return null
  }

  render() {
    let returnTo = '';

    if ( this.state.backURLType && this.state.backURLType === 'clients' ) {
      returnTo = (this.props.match.params.actionType) ? "/" + this.props.match.params.actionType + "/" + this.props.match.params.action + "/" + this.props.match.params.clientID  : "/" + this.props.match.params.actionType;
    }

    let imageData = this.state.afterImageData;

    let frontImageSrc = this.state.def_no_image_vertical;

    if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_front ) {
      if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_front_url ) {
        frontImageSrc = imageData.procedure_after_photos.patient_image_front_url;
      }
    }

    let leftImageSrc = this.state.def_no_image_vertical;

    if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_left ) {
      if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_left_url ) {
        leftImageSrc = imageData.procedure_after_photos.patient_image_left_url;
      }
    }

    let leftImage45Src = this.state.def_no_image_vertical;

    if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_left_45 ) {
      if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_left_45_url ) {
        leftImage45Src = imageData.procedure_after_photos.patient_image_left_45_url;
      }
    }

    let rightImageSrc = this.state.def_no_image_vertical;

    if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_right ) {
      if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_right_url ) {
        rightImageSrc = imageData.procedure_after_photos.patient_image_right_url;
      }
    }

    let rightImage45Src = this.state.def_no_image_vertical;

    if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_right_45 ) {
      if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_right_45_url ) {
        rightImage45Src = imageData.procedure_after_photos.patient_image_right_45_url;
      }
    }

    let backImageSrc = this.state.def_no_image_vertical;

    if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_back ) {
      if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_back_url ) {
        backImageSrc = imageData.procedure_after_photos.patient_image_back_url;
      }
    }

    let backImageLeft45Src = this.state.def_no_image_vertical;

    if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_back_left_45 ) {
      if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_back_left_45_url ) {
        backImageLeft45Src = imageData.procedure_after_photos.patient_image_back_left_45_url;
      }
    }

    let backImageRight45Src = this.state.def_no_image_vertical

    if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_back_right_45 ) {
      if ( imageData && imageData.procedure_after_photos && imageData.procedure_after_photos.patient_image_back_right_45_url ) {
        backImageRight45Src = imageData.procedure_after_photos.patient_image_back_right_45_url;
      }
    }

    return (
      <div id="content">
         <div className="container-fluid content setting-wrapper">
            <div className="juvly-section full-width m-t-15">
               <div className="juvly-container">
                  <div className="juvly-title m-b-30">{(this.state.afterImageData && this.state.afterImageData.patient) && displayName(this.state.afterImageData.patient) + ' - '} { (this.state.afterImageData) && this.state.afterImageData.procedure_name}
                     <Link to={returnTo} className="pull-right"><img src={picClose}/></Link>
                  </div>
                  {(imageData && imageData.type !== 'laser') ? <div className="pdfImageContainer">
                    <div className="juvly-subtitle">After Images - 45 Degrees</div>
                    <div className="row">
                       <div className="col-sm-4 col-xs-12">
                          <div className="procedure-img">
                             <img src={leftImage45Src}/>
                          </div>
                       </div>
                       <div className="col-sm-4 col-xs-12">
                          <div className="procedure-img">
                             <img src={frontImageSrc}/>
                          </div>
                       </div>
                       <div className="col-sm-4 col-xs-12">
                          <div className="procedure-img">
                             <img src={rightImage45Src}/>
                          </div>
                       </div>
                    </div>
                    <div className="juvly-subtitle m-t-40">After Images - 90 Degrees</div>
                    <div className="row">
                       <div className="col-sm-4 col-xs-12">
                          <div className="procedure-img">
                             <img src={leftImageSrc}/>
                          </div>
                       </div>
                       <div className="col-sm-4 col-xs-12">
                          <div className="procedure-img">
                             <img src={frontImageSrc}/>
                          </div>
                       </div>
                       <div className="col-sm-4 col-xs-12">
                          <div className="procedure-img">
                             <img src={rightImageSrc}/>
                          </div>
                       </div>
                    </div>
                    <div className={(imageData && imageData.type === 'coolsculpting') ? "juvly-subtitle m-t-40" : "juvly-subtitle m-t-40 no-display"}>After Images - Back</div>
                    <div className={(imageData && imageData.type === 'coolsculpting') ? "row" : "row no-display"}>
                        <div className="col-sm-4 col-xs-12">
                           <div className="procedure-img">
                              <img src={backImageLeft45Src}/>
                           </div>
                        </div>
                       <div className="col-sm-4 col-xs-12">
                          <div className="procedure-img">
                             <img src={backImageSrc}/>
                          </div>
                       </div>

                       <div className="col-sm-4 col-xs-12">
                          <div className="procedure-img">
                             <img src={backImageRight45Src}/>
                          </div>
                       </div>
                    </div>
                  </div>
                  :
                  (imageData && imageData.type === 'laser') ? <div className="pdfImageContainer">
                  <div className="juvly-subtitle">After Images</div>
                    <div className="row">
                       <div className="col-sm-4 col-xs-12">
                          <div className="procedure-img">
                             <img src={leftImage45Src}/>
                          </div>
                       </div>
                       <div className="col-sm-4 col-xs-12">
                          <div className="procedure-img">
                             <img src={frontImageSrc}/>
                          </div>
                       </div>
                       <div className="col-sm-4 col-xs-12">
                          <div className="procedure-img">
                             <img src={rightImage45Src}/>
                          </div>
                       </div>
                    </div>
                  </div>
                  :
                  <div className="col-xs-12 text-center">
                     <div className="procedure-img">
                        <img src={frontImageSrc}/>
                     </div>
                  </div>
                  }
               </div>
            </div>
         </div>

         <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock clientLoader clientProfileLoader' : 'new-loader text-left'}>
           <div className="loader-outer">
             <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
             <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.loading_please_wait_text}</div>
           </div>
         </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState  = {};

  if ( state.ClientsReducer.action === "VIEW_AFTER_PHOTOS" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.afterImageData = state.ClientsReducer.data;
    } else {
      returnState.afterImageData = state.ClientsReducer.data;
    }
  }

  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({getAfterPhotos: getAfterPhotos}, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps) (AfterPhotos);
