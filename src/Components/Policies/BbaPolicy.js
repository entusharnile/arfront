import React, { Component } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
export default class BbaPolicy extends React.Component {

  handleAccept = () => {
    if(this.props.value && !this.props.processingLoder){
      this.props.handleChildChange({isBbaPolicyAccepted:true});
      this.props.toggleSignUpForm(this.props.nextStep,true);
    }
  }
  render() {
    return (
      <div className="login-main-policy">
  			<div className="policy-info">
          {(this.props.signUpLabel != undefined) ?
            <div className="col-sm-12">
              <div className="login-title">{this.props.signUpLabel}</div>
            </div>
            :
            null
          }
  				<div className="col-sm-12 hippa-section">
  					<div className="member-section">
  						<div className="member-section-title no-margin">{this.props.globalLang.signup_aesthetic_record_terms_of_service}</div>
  						<div className="term-policy-div">
                <Scrollbars style={{ height: 370 }}  >
                  This HIPAA Business Associate  Addendum ("BAA") is entered into between Aesthetic Record LLC ("Aesthetic Record") and the customer agreeing to the terms below ("Customer"), and supplements, amends and is incorporated into the Services  Agreement(s) (defined below) solely with respect to Covered Services (defined below).
                  <br /><br />
                  This BAA will be effective as of the date electronically accepted by Customer (the "BAA Effective Date”). Customer must have an existing Services Agreement in place for this BAA to be valid and effective.
                  <br /><br />
                  Together with the Services Agreement, this BAA will govern each party's respective obligations regarding Protected Health Information (defined below).
                  <br /><br />
                  You represent and warrant that (i) you have the full legal authority to bind Customer to this BAA, (ii) you have read and understand this BAA, and (iii) you agree, on behalf of Customer to the terms of this BAA.
                  <br /><br />
                  <strong>If you do not have legal authority to bind Customer, or do not agree to these terms, please do not click to accept the terms of this BAA.</strong>
                  <br /><br />
                  <strong>1. Definitions.</strong>
                  <br /><br />
                  Any capitalized terms used but not otherwise defined in this BAA will have the meaning given to them in HIPAA and the HITECH Act.
                  <br /><br />
                  "Business Associate" has the definition given to it under HIPAA.
                  <br /><br />
                  "Breach" has the definition given to it under HIPAA. A Breach will not include an acquisition, access, use, or disclosure of PHI with respect to which Aesthetic Record has determined in accordance with 45 C.F.R. § 164.402 that there is a low probability that the PHI has been compromised.
                  <br /><br />
                  "Covered Entity" has the definition given to it under HIPAA.
                  <br /><br />
                  "Covered Services" means the Aesthetic Record products and services that provide the following functionality as included with the application: Calendar, scheduling, EMR, picture taking, data storage within the application. All services outside of the application including, but not limited to, local storage of files, communications outside of the application, etc. are not included.
                  <br /><br />
                  "HIPAA" means the Health Insurance Portability and Accountability Act of 1996 and the rules and the regulations thereunder, as amended.
                  <br /><br />
                  "HITECH Act" means the Health Information Technology for Economic and Clinical Health Act enacted in the United States Congress, which is Title XIII of the American Recovery &amp; Reinvestment Act, and the regulations thereunder, as amended.
                  <br /><br />
                  "Protected Health Information" or "PHI" has the definition given to it under HIPAA  and for purposes of this BAA is limited to PHI within Customer Data to which Aesthetic Record has access through the Covered Services in connection with Customer's permitted use of Covered Services.
                  <br /><br />
                  "Security Breach" means any Breach of Unsecured PHI or Security Incident of which Aesthetic Record becomes aware.
                  <br /><br />
                  "Security Incident" has the definition given to it under HIPAA.
                  <br /><br />
                  "Services Agreement(s)" means the written agreement(s) entered into between Aesthetic Record and Customer for provision of the Covered Services, which agreement(s) may be in the form of online terms of service.
                  <br /><br />
                  <strong>2. Applicability.</strong>
                  <br /><br />
                  This BAA applies to the extent Customer is acting as a Covered Entity or a Business Associate to create, receive, maintain, or transmit PHI via a Covered Service and to the extent Aesthetic Record, as a result, is deemed under HIPAA to be acting as a Business Associate or Subcontractor of Customer. Customer acknowledges that this BAA does not apply to, or govern, any other Aesthetic Record product, service, or feature that is not a Covered Service.
                  <br /><br />
                  <strong>3. Use and Disclosure of PHI.</strong>
                  <br /><br />
                  (a) Except as otherwise stated in this BAA, Aesthetic Record may use and disclose PHI only as permitted or required by the Services Agreements and/or this BAA or as Required by Law.
                  <br />(b) Aesthetic Record may use and disclose PHI for the proper management and administration of Aesthetic Record's business and to carry out the legal responsibilities of Aesthetic Record, provided that any disclosure of PHI for such purposes may only occur if:
                  (1) required by applicable law; or (2) Aesthetic Record obtains written reasonable assurances from the person to whom PHI will be disclosed that it will be held in confidence, used only for the purpose for which it was disclosed, and that Aesthetic Record will be notified of any Security Breach.
                  <br />(c) Aesthetic Record may also use PHI to create de identified information in a manner consistent with the standards stated in HIPAA, and may use or disclose such de-identified PHI for any purpose in accordance with HIPAA.
                  <br />(d) Aesthetic Record has no obligations under this BAA  with respect to any PHI that Customer creates, receives, maintains, or transmits outside of the Covered Services (including Customer's use of its offline or on­-premise storage tools or third-­party applications) and this BAA will not apply to any PHI created, received, maintained or transmitted outside of the Covered Services.
                  <br /><br />
                  <strong>4. Customer Obligations.</strong>
                  <br /><br />
                  (a) Customer may only use the Covered Services to create, receive, maintain, or transmit PHI. Customer is solely responsible for managing whether Customer's end users are authorized to share, disclose, create, and/or use PHI within the Covered Services.
                  <br />(b) Customer will not request that Aesthetic Record or the Covered Services use or disclose PHI in any manner that would not be permissible under HIPAA if done by Customer (if Customer is a Covered Entity) or by the Covered Entity to which Customer is a Business Associate (unless expressly permitted under HIPAA for a Business Associate).
                  <br />(c) For End Users that use the Covered Services in connection with PHI, Customer will use controls available within the Services to ensure its use of PHI is limited to the Covered Services. Customer acknowledges and agrees that Customer is solely responsible for ensuring that its and its End Users' use of the Covered Services complies with HIPAA and HITECH.
                  <br />(d) Customer will take appropriate measures to limit its use of PHI to the Covered Services and will limit its use within the Covered Services to the minimum extent necessary for Customer to carry out its authorized use of such PHI.
                  <br />(e) Customer warrants that it has obtained and will obtain any consents, authorizations and/or other legal permissions required under HIPAA and/or other applicable law for the disclosure of PHI to Aesthetic Record.
                  <br /><br />
                  Customer will notify Aesthetic Record of any changes in, or revocation of, the permission by an Individual to use or disclose his or her PHI, to the extent that such changes may affect Aesthetic Record's use or disclosure of PHI. Customer will not agree to any restriction on the use or disclosure of PHI under 45 CFR § 164.522 that restricts Aesthetic Record's use or disclosure of PHI under the  Agreement unless such restriction is required by law.
                  <br /><br />
                  <strong>5. Appropriate Safeguards.</strong>
                  <br /><br />
                  Aesthetic Record and Customer will each use appropriate safeguards designed to prevent against unauthorized use or disclosure of PHI, and as otherwise required under HIPAA, with respect to the Covered Services.
                  <br /><br />
                  <strong>6. Reporting.</strong>
                  <br /><br />
                  (a) Subject to Section 6(d), Aesthetic Record will promptly notify Customer following Aesthetic Record's Discovery of a Security Breach in accordance with HIPAA and in the most expedient time possible under the circumstances, consistent with the legitimate needs of applicable law enforcement and applicable laws, and after taking any measures Aesthetic Record deems necessary to determine the scope of the Security Breach and to restore the reasonable integrity of Aesthetic Record's systems.
                  <br />
                  (b) To the extent reasonably practicable, Aesthetic Record will use commercially reasonable efforts to mitigate any further harmful effects of a Security Breach caused by Aesthetic Record.
                  <br />
                  (c) Aesthetic Record will send any applicable Security Breach notifications to the notification email  address provided by Customer in the Services Agreement or via direct communication with the Customer.
                  <br />
                  (d) Notwithstanding Section 6(a), this Section 6(d) will be deemed as notice to Customer that Aesthetic Record periodically receives unsuccessful attempts for unauthorized access, use, disclosure, modification or destruction of information, or interference with the general operation of Aesthetic Record's information systems and the Covered Services. Customer acknowledges and agrees that even if such events constitute a Security Incident as that term is defined under HIPAA, Aesthetic Record will not be required to provide any notice under this BAA regarding such unsuccessful attempts other than this Section 6(d).
                  <br /><br />
                  <strong>7. Subcontractors.</strong>
                  <br /><br />
                  <b>
                    Aesthetic Record will take appropriate measures to ensure that any Subcontractors used by Aesthetic Record to perform its obligations under the Services Agreements that require access to PHI on behalf of Aesthetic Record are bound by written obligations that provide the same material level of protection for PHI a this BAA.
                  </b>
                  <br /><br />
                  <b>
                    To the extent Aesthetic Record uses Subcontractors in its performance of obligations hereunder, Aesthetic Record will remain responsible for their performance as if performed by Aesthetic Record.
                  </b>
                  <br /><br />
                  <strong>8. Access and Amendment.</strong>
                  <br /><br />
                  Customer acknowledges and agrees that Customer is solely responsible for the form and content of PHI maintained by Customer within the Covered Services, including whether Customer maintains such PHI in a Designated Record Set within the Covered Services. Aesthetic Record will provide Customer with access to Customer's PHI via the Covered Services so that Customer may fulfill its obligations under HIPAA with respect to Individuals' rights of access and amendment, but will have no other obligations to Customer or any Individual with respect to the rights afforded to Individuals by HIPAA with respect to Designated Record Sets, including rights of access or amendment of PHI. Customer is responsible for managing its use of the Covered Services to appropriately respond to such Individual requests.
                  <br /><br />
                  <strong>9. Accounting of Disclosures.</strong>
                  <br /><br />
                  Aesthetic Record will document disclosures of PHI by Aesthetic Record and provide an accounting of such disclosures to Customer as and to the extent required of a Business Associate under HIPAA and in accordance with the requirements applicable to a Business Associate under HIPAA.
                  <br /><br />
                  <strong>10.	Access to Records.</strong>
                  <br /><br />
                  To the extent required by law, and subject to applicable attorney client privileges, Aesthetic Record will make its internal practices, books, and records concerning the use and disclosure of PHI received from Customer, or created or received by Aesthetic Record on behalf of Customer, available to the Secretary of the U.S. Department of Health and Human Services (the "Secretary") for the purpose of the Secretary determining compliance with this BAA.
                  <br /><br />
                  <strong>11. Expiration and Termination.</strong>
                  <br /><br />
                  (a) This BAA will terminate on the earlier of (i) a permitted termination in accordance with Section 11(b) below, or (ii) the expiration or termination of all Services Agreements under which Customer has access to a Covered Service.
                  <br />
                  (b) If either party materially breaches this BAA, the non-breaching party may terminate this BAA on 10 days' written notice to the breaching party unless the breach is cured within the 10-day period. If a cure under this Section 11(b) is not reasonably possible, the non­breaching party may immediately terminate this BAA, or if neither termination nor cure is reasonably possible under this Section 11(b), the non­breaching party may report the violation to the Secretary, subject to all applicable legal privileges.
                  <br />
                  (c) If this BAA is terminated earlier than the Services Agreements, Customer may continue to use the Services in accordance with the Services Agreements, but must delete any PHI it maintains in the Covered Services and cease to further create, receive, maintain, or transmit such PHI to Aesthetic Record.
                  <br /><br />
                  <strong>12. Return/Destruction of Information.</strong>
                  <br /><br />
                  On termination of the Services Agreements, Aesthetic Record will return or destroy all PHI received from Customer, or created or received by Aesthetic Record on behalf of Customer; provided, however, that if such return or destruction is not feasible, Aesthetic Record will extend the protections of this BAA to the PHI not returned or destroyed and limit further uses and disclosures to those purposes that make the return or destruction of the PHI infeasible.
                  <br /><br />
                  <strong>13. Miscellaneous.</strong>
                  <br /><br />
                  (a) Survival. Sections 12 (Return/Destruction of Information) and 13 (Return/Destruction of Information) will survive termination or expiration of this BAA.
                  <br />
                  (b) Counterparts. The parties may execute this BAA in counterparts, including facsimile, PDF or other electronic copies, which taken together will constitute one instrument.
                  <br /><br />
                  Effects of Addendum.
                  <br />
                  To the extent this BAA conflicts with the remainder of the Services Agreement(s), this BAA will govern. This BAA is subject to the Governing Law section in the Services Agreement(s). Except as expressly modified or amended under this BAA, the terms of the Services Agreement(s) remain in full force and effect.
                </Scrollbars>
              </div>
              <div className="member-section-footer">
                <label htmlFor="agree_checkbox">
                  <input type="checkbox" name={this.props.name} checked={(this.props.value) ? 'checked' : false} onChange={this.props.handleInputChange} /> {this.props.globalLang.signup_accept_aesthetic_record_terms_of_service}</label>
                  <button disabled={this.props.processingLoder ? true : !this.props.value ? true : false } className={(this.props.processingLoder) ? "agree-btn agree-btn-loader" : ((!this.props.value) ? "agree-btn disable" : "agree-btn")} onClick={this.handleAccept}>
                  {(this.props.processingLoder) ? this.props.globalLang.signup_please_wait : this.props.globalLang.signup_button_i_agree} <img className={(this.props.processingLoder) ? "" : "no-display"} src="../images/btn-load.gif"/>
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
