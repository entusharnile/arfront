import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { ToastContainer, toast } from "react-toastify";
import {viewTreatmentMarkings} from '../../Actions/TreatmentMarkings/treatActions.js'
import { displayName } from '../../Utils/services.js';
import defVImage from '../../images/no-image-vertical.png';


class TreatmentMarkings extends Component {
  constructor(props) {
    super(props);

    const languageData  = JSON.parse(localStorage.getItem('languageData'))

    this.state = {
      backURLType           : this.props.match.url.split('/')[1],
      action                : (this.props.match.params.type) ? this.props.match.params.type : 'profile',
      showLoader            : false,
      procedureID           : this.props.match.params.procedureID,
      globalLang            : languageData.global,
      treatmentMarkingData  : [],
      def_no_image_vertical : defVImage,
      languageData          : languageData.clients,
    }
  }

  componentDidMount() {
    this.setState({
      showLoader: true
    });

    this.props.viewTreatmentMarkings(this.state.procedureID);
  }

  static getDerivedStateFromProps(props, state) {
    if(props.showLoader != undefined && props.showLoader == false) {
        return {showLoader : false};
     }
    if ( props.treatmentMarkingData !== undefined && props.treatmentMarkingData.status === 200 && props.treatmentMarkingData.data !== state.treatmentMarkingData ) {
      return {
        treatmentMarkingData: props.treatmentMarkingData.data,
        showLoader          : false
      }
    }

    return null
  }

  render() {
    let returnTo = '';

    if ( this.state.backURLType && this.state.backURLType === 'clients' ) {
      returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID  : "/" + this.state.backURLType
    } else {

    }
    let imageData = this.state.treatmentMarkingData;

    let frontImageSrc = this.state.def_no_image_vertical

    if ( imageData && imageData.procedure_image_data && imageData.procedure_image_data.patient_image_front ) {
      if ( imageData && imageData.pdf_image && imageData.pdf_image.front_pdf_image_url ) {
        frontImageSrc = imageData.pdf_image.front_pdf_image_url
      }
    }

    let leftImageSrc = this.state.def_no_image_vertical

    if ( imageData && imageData.procedure_image_data && imageData.procedure_image_data.patient_image_left ) {
      if ( imageData && imageData.pdf_image && imageData.pdf_image.left_pdf_image_url ) {
        leftImageSrc = imageData.pdf_image.left_pdf_image_url
      }
    }

    let leftImage45Src = this.state.def_no_image_vertical

    if ( imageData && imageData.procedure_image_data && imageData.procedure_image_data.patient_image_left_45 ) {
      if ( imageData && imageData.pdf_image && imageData.pdf_image.left_pdf_image_45_url ) {
        leftImage45Src = imageData.pdf_image.left_pdf_image_45_url
      }
    }

    let rightImageSrc = this.state.def_no_image_vertical

    if ( imageData && imageData.procedure_image_data && imageData.procedure_image_data.patient_image_right ) {
      if ( imageData && imageData.pdf_image && imageData.pdf_image.right_pdf_image_url ) {
        rightImageSrc = imageData.pdf_image.right_pdf_image_url
      }
    }

    let rightImage45Src = this.state.def_no_image_vertical

    if ( imageData && imageData.procedure_image_data && imageData.procedure_image_data.patient_image_right_45 ) {
      if ( imageData && imageData.pdf_image && imageData.pdf_image.right_pdf_image_45_url ) {
        rightImage45Src = imageData.pdf_image.right_pdf_image_45_url
      }
    }

    let backImageSrc = this.state.def_no_image_vertical

    if ( (imageData && imageData.procedure_image_data && imageData.pdf_image) && (imageData.procedure_image_data.patient_image_back || imageData.pdf_image.back_pdf_image_url) ) {
      if ( imageData && imageData.pdf_image && imageData.pdf_image.back_pdf_image_url ) {
        backImageSrc = imageData.pdf_image.back_pdf_image_url
      }
    }

    let backImageLeft45Src = this.state.def_no_image_vertical

    if ( (imageData && imageData.procedure_image_data && imageData.pdf_image) && (imageData.procedure_image_data.patient_image_back_left_45 || imageData.pdf_image.back_pdf_image_left_45_url) ) {
      if ( imageData && imageData.pdf_image && imageData.pdf_image.back_pdf_image_left_45_url ) {
        backImageLeft45Src = imageData.pdf_image.back_pdf_image_left_45_url
      }
    }

    let backImageRight45Src = this.state.def_no_image_vertical

    if ( (imageData && imageData.procedure_image_data && imageData.pdf_image) && (imageData.procedure_image_data.patient_image_back_right_45 || imageData.pdf_image.back_pdf_image_right_45_url) ) {
      if ( imageData && imageData.pdf_image && imageData.pdf_image.back_pdf_image_right_45_url ) {
        backImageRight45Src = imageData.pdf_image.back_pdf_image_right_45_url
      }
    }

    let proImageSrc = this.state.def_no_image_vertical

    if ( imageData && imageData.procedure_image ) {
      if ( imageData && imageData.procedure_image_url ) {
        proImageSrc = imageData.procedure_image_url
      }
    }

    let proImage45Src = this.state.def_no_image_vertical

    if ( imageData && imageData.procedure_image_45 ) {
      if ( imageData && imageData.procedure_image_45_url ) {
        proImage45Src = imageData.procedure_image_45_url
      }
    }

    return (
      <div id="content">
         <div className="container-fluid content setting-wrapper">
            <div className="juvly-section full-width m-t-15">
               <div className="juvly-container">
                  <div className="juvly-title m-b-30">{(this.state.treatmentMarkingData && this.state.treatmentMarkingData.patient) && displayName(this.state.treatmentMarkingData.patient) + ' - '} { (this.state.treatmentMarkingData) && this.state.treatmentMarkingData.procedure_name}
                     <Link to={returnTo} className="pull-right"><img src="../../../../images/close.png"/></Link>
                  </div>
                  {(imageData && imageData.type !== 'laser') ? <div className="pdfImageContainer">
                    <div className="juvly-subtitle">{this.state.languageData.pro_image_45_deg}</div>
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
                       <div className="col-xs-12 text-center">
                          <div className="procedure-img">
                             <img src={proImage45Src}/>
                          </div>
                       </div>
                    </div>
                    <div className="juvly-subtitle m-t-40">{this.state.languageData.pro_image_90_deg}</div>
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
                       <div className="col-xs-12 text-center">
                          <div className="procedure-img">
                             <img src={proImageSrc}/>
                          </div>
                       </div>
                    </div>
                    <div className={(imageData && imageData.type === 'coolsculpting') ? "juvly-subtitle m-t-40" : "juvly-subtitle m-t-40 no-display"}>{this.state.languageData.client_pro_image_back}</div>
                    <div className={(imageData && imageData.type === 'coolsculpting') ? "row" : "row no-display"}>
                       <div className="col-sm-4 col-xs-12">
                          <div className="procedure-img">
                             <img src={backImageLeft45Src}/>
                          </div>
                       </div>
                       <div className="col-sm-4 col-xs-12">
                          <div className="procedure-img">
                             <img src={frontImageSrc}/>
                          </div>
                       </div>
                       <div className="col-sm-4 col-xs-12">
                          <div className="procedure-img">
                             <img src={backImageRight45Src}/>
                          </div>
                       </div>
                       <div className="col-xs-12 text-center">
                          <div className="procedure-img">
                             <img src={backImageSrc}/>
                          </div>
                       </div>
                    </div>
                  </div>
                  :
                  (imageData && imageData.type === 'laser') ? <div className="pdfImageContainer">
                  <div className="juvly-subtitle">{this.state.languageData.client_pro_images}</div>
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

                       {/*<div className="col-xs-12 text-center">
                          <div className="procedure-img">
                             <img src={proImage45Src}/>
                          </div>
                       </div>*/}
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

  if ( state.TreatmentMarkingReducer.action === 'VIEW_TREATMENT_MARKINGS' ) {
    if ( state.TreatmentMarkingReducer.data.status != 200 ) {
      toast.error(languageData.global[state.TreatmentMarkingReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.treatmentMarkingData = state.TreatmentMarkingReducer.data
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({viewTreatmentMarkings: viewTreatmentMarkings}, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps) (TreatmentMarkings);
