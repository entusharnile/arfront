import React, { Component } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
export default class HippaPolicy extends React.Component {

  handleAccept = () => {
    this.props.handleChildChange({isHppaPolicyAccepted:true});
    this.props.toggleSignUpForm(this.props.nextStep);
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
  						<div className="member-section-title no-margin">{this.props.globalLang.signup_hippa_business_associate_addendum}</div>
  						<div className="term-policy-div">
                <Scrollbars style={{ height: 370 }}  >
                  <h4>General</h4>
                  <p>
                    Thank you for choosing Aesthetic Record (“Service Provider”) for your business. When you (also referred to herein as “Customer”) use our products and services you’re agreeing to our terms and the applicable privacy policy, so please read these Terms of Service carefully as they contain important information regarding your legal rights and obligations. Certain capitalized words below are defined herein.
                  </p>
                  <p>
                    Aesthetic Record provides online business management software services for the aesthetics and beauty industry (“Software Service”). You can access our Software Service via the login page on our website and through our app.
                  </p>
                  <p>
                    The order confirmation when you signed up for our Software Service (the “Order Confirmation”) and these terms (collectively, this “Agreement”) comprise the entire agreement between the parties, and supersede all prior or contemporaneous understandings, agreements, negotiations, representations and warranties, and communications, both written and oral.
                  </p>
                  <p>
                    This Agreement prevails over any Customer’s general terms and conditions regardless whether or when Customer has submitted its request for proposal, order, or such terms. Provision of services to Customer does not constitute acceptance of any of Customer’s terms and conditions and does not serve to modify or amend this Agreement.
                  </p>
                  <p>
                    This Agreement applies to any use of and access to our Software Service, Website or App (collectively, “Services”) by you and your Affiliates. By accessing or using any Software Services (or enabling an Affiliate to access or use any Software Services), you are indicating that you have read this Agreement and agree to be bound by its terms. If you do not agree with all of the terms of this Agreement, you may not access or use any Services.
                  </p>
                  <p>
                    This Agreement is effective (“Effective Date”) on the earlier of (a) the date you accept this Agreement by clicking an “Accept” or similar button or otherwise indicate that you accept this Agreement (including through an Order Confirmation), or (b) the date you (or an Affiliate) first access or use any Services.
                  </p>
                  <p>
                    When you use our Services, you are entering into a legal agreement and you agree to all of these terms. If you enter into this Agreement on behalf of a company or other legal entity, you represent and warrant that you have the legal authority to bind that entity and its Affiliates to this Agreement, and all references to “you” and “your” in this Agreement are referring to that entity. You and Aesthetic Record are also sometimes referred to in this Agreement individually as a “Party” and collectively as the “Parties.”
                  </p>
                  <p>
                    <b>
                      Our privacy policy governs how we collect and use personal information that is submitted through the Services. By accessing or using the services, you agree that you have read and accepted our privacy policy and agree to its terms.
                    </b>
                  </p>
                  <p>
                    This Agreement applies to any use of the Services, whether in connection with a paid subscription or a free trial. Certain additional terms apply if you are entering information that originates in the European Economic Area.
                  </p>
                  <p>
                    We continuously strive to improve our products and services, and as our business evolves, this agreement may change. This section describes how we can change the agreement. We may, in our sole discretion, make changes to this Agreement from time to time. Any changes we make will become effective when we post a modified version of the Agreement to our Website or app, and we agree the changes will not be retroactive. If we make any material changes to the Agreement, we’ll also notify you within the Software Service or by sending you an email. If you continue using the Services after any changes, it means you have accepted them. If you do not agree to any changes, you must stop using the Services and you must cancel your account. It is your obligation to ensure that you read, understand and agree to the latest version of the Agreement that’s posted on our Website. The legend at the top of the Agreement indicates when it was last changed.
                  </p>
                  <p>
                    Additional terms apply to certain products that we provide. Your use of, and participation in, certain Services may be subject to additional terms (“Supplemental Terms”) and such Supplemental Terms will either be listed in this Agreement or will be presented to you for your acceptance when you sign up to use the supplemental Service. If this Agreement is inconsistent with the Supplemental Terms, the Supplemental Terms will control with respect to the service with which it applies.
                  </p>
                  <h4>Your Data and Your Business</h4>
                  <p>
                    “Your Data” means any data, information or material provided or submitted or made available by you and Affiliates to the Services. Your Data may include End User Data and Cardholder Data (and your or their representative’s data), but excludes Aggregated Data.
                  </p>
                  <p>
                    “Affiliate” means any entity that directly or indirectly controls, is controlled by, or is under common control with you, and that has been designated to receive Services under this Agreement. “Control” for purposes of this definition means the power to direct or cause the direction of the management and policies of the subject entity, whether through equity ownership, a credit arrangement, franchise agreement or other contractual arrangement. “Affiliate” also includes any of your business locations and any Franchisees that have been designated to receive Services under this Agreement.
                  </p>
                  <p>
                    <b>
                      As between you and Aesthetic Record, you own all right, title and interest in Your Data. You hereby grant Aesthetic Record a non-exclusive, worldwide, assignable, sublicensable, fully paid-up and royalty-free license and right to copy, distribute, display and perform, publish, prepare derivative works of and otherwise use Your Data for the purposes of providing, improving and developing Aesthetic Record’s products and services and/or complementary products and services of our partners and for the purposes of cooperating with government authorities should Your Data ever be requested. You represent and warrant to Aesthetic Record that you have all rights necessary to grant the licenses and that the provision of Your Data through and in connection with the services does not violate any applicable laws or rights of any third party.
                    </b>
                  </p>
                  <p>
                    <b>
                      You represent and warrant to Aesthetic Record that you have all the legal licenses, rights and insurance necessary to conduct your business and collect Your Data.
                    </b>
                  </p>
                  <p>
                    You authorize Aesthetic Record to aggregate or anonymize Your Data or other data in connection with the Agreement, and Aesthetic Record will own all Aggregated Data. You agree that nothing in this Agreement will prohibit Aesthetic Record or its affiliates from utilizing Aggregated Data for any purpose, provided such Aggregated Data does not reveal any personally identifying information about you or any end users.
                  </p>
                  <p>
                    <b>
                      Notwithstanding any other sections of this Agreement, all right, title and interest in any data or information collected by Aesthetic Record independently and without access to, reference to or use of any of Your Data, including, without limitation, any data or information Aesthetic Record obtains through the Aesthetic Record app or website (whether the same as Your Data or otherwise), will be solely owned by Aesthetic Record.
                    </b>
                  </p>
                  <h4>Our Services</h4>
                  <p>
                    Aesthetic Record will make the Services to which you have subscribed available to you, subject to the terms and conditions of this Agreement. We may temporarily suspend your access for things like scheduled maintenance, or if a natural disaster occurs. We may also change or discontinue particular features or functions of our Services at any time.
                  </p>
                  <p>
                    We reserve the right to suspend any Services during planned downtime, in connection with a force majeure event, or if we believe any malicious software is being used in connection with your account. In addition, we reserve the right to change, suspend or discontinue any features, components or functions of the Services at any time. If we make any material changes to the Software Service, we’ll notify you within the Software Service or by sending you an email. Notwithstanding the above, we have no obligation to update or enhance any Services or to produce or release new versions of any Services.
                  </p>
                  <p>
                    We aren’t responsible for any third party products that are integrated with or used in connection with the Services.
                  </p>
                  <p>
                    Although the Services may allow you to access or use Third Party Offerings, they are not “Services” under this Agreement and are not subject to any of the warranties, service commitments or other obligations with respect to Services hereunder. The availability of any Third Party Offerings through the Services does not imply Aesthetic Record’s endorsement of or affiliation with the provider.
                  </p>
                  <p>
                    Your standard subscription fees include our standard support services. You may also purchase additional services for an additional fee.
                  </p>
                  <p>
                    When you subscribe to our Software Service, and when available, your business will be provided the opportunity to be listed on Aesthetic Record’s online marketing platform and marketplace (“Marketing Services”), which allows consumers to locate Aesthetic Record subscribers and evaluate, review and book their services, directly through the Aesthetic Record App and through our partner applications. From time to time, Aesthetic Record may offer subscribers the opportunity to participate in promotional programs (“AR Promos”), which are designed to promote their businesses and attract customers through the Marketing Services. Aesthetic Record reserves the right to charge fees for AR Promos.
                  </p>
                  <p>
                    We are not responsible for any damages resulting from your use of any trial or beta services.
                  </p>
                  <p>
                    Aesthetic Record may in its sole discretion offer free, trial or beta Services from time to time at no charge. Notwithstanding anything to the contrary herein: (a) any free, trial or beta Services are provided “AS IS” with no warranties of any kind; and (b) Aesthetic Record may discontinue any free, trial or beta Services or your ability to use such Services at any time, with or without notice and without any further obligations to you. Without limiting the generality of the foregoing, free Services that have not been accessed or used for 3 consecutive months may be terminated by us. Aesthetic Record will have no liability for any harm or damages suffered by you or any third party in connection with any free, trial or beta services.
                  </p>
                  <p>
                    Aesthetic Record offers the ability to process payments through the Services (“Payment Processing Services”). Payment Processing Services are provided by our third party payment processing partner as Third Party Offerings and any procurement by you or your Affiliates will be subject to a separate merchant agreement which will be solely between you (or your Affiliate) and the third party processor.
                  </p>
                  <p>
                    At Aesthetic Record’s sole discretion, you may be offered Payment Processing Services provided by Stripe (“Aesthetic Record Payments”). Aesthetic Record Payments are subject to certain fees and charges communicated to you during the enrollment process and as may be updated by Aesthetic Record from time to time. By enrolling in Aesthetic Record Payments, you agree to be bound by the Stripe Services Agreement, as the same may be modified by Stripe from time to time. As a condition of Aesthetic Record enabling payment processing services through Stripe, you agree to provide Aesthetic Record accurate and complete information about you and your business, and you authorize Aesthetic Record to share it and transaction information related to your use of the payment processing services provided by Stripe pursuant to our Privacy Policy. To the extent permitted by law, we may collect any obligations you owe us under this Agreement by deducting the corresponding amounts from funds payable to you arising from the settlement of card transactions through Aesthetic Record Payments. Fees will be assessed at the time a transaction is processed and will be first deducted from the funds received for such transactions. If the settlement amounts are not sufficient to meet your obligations to us, we may charge or debit the bank account or credit card registered in your account for any amounts owed to us. Your failure to fully pay amounts that you owe us on demand will be a breach of this Agreement. You will be liable for our costs associated with collection in addition to the amount owed, including without limitation attorneys' fees and expenses, costs of any arbitration or court proceeding, collection agency fees, and any applicable interest. Additionally, we may require a personal guaranty from a principal of a business for funds owed under this Agreement. If we require a personal guarantee we will specifically inform you. In addition to the amount due, delinquent accounts may be charged with fees that are incidental to the collection of delinquent accounts and chargebacks including, but not limited to, collection fees and convenience fees and other third parties charges. You hereby explicitly agree that communication from Aesthetic Record in relation to delinquent accounts may made by electronic mail or by phone or by other communication methods.
                  </p>
                  <p>
                    <b>
                      All transactions that are done via card swipe using a card reader will be charged 2.75% plus any fees Stripe or its successor processor may charge, All transactions done via manual card entry or key entry will be charged 3.50% plus any fees Stripe may charge.
                    </b>
                  </p>
                  <p>
                    <b>
                      Aesthetic Record reserves the right to not offer the service to certain clients in its sole determination. In such situations, Aesthetic Record will provide the client 30 days written notice, unless the reason your account is being terminated is because of an alleged violation of a law, harassment or similar, in which case your account may be terminated sooner.
                    </b>
                  </p>
                  <p>
                    <b>
                      Card readers purchased by you in connection with this Agreement are final sale. They cannot be returned, exchanged or refunded.
                    </b>
                  </p>
                  <p>
                    If we make multiple discounts or pricing options for a service available to you at one time, you will only be eligible to receive one discount or pricing option, and will not be entitled to cumulative discounting and pricing options.
                  </p>
                  <p>
                    You will ensure that all information you provide to us via the website or app is accurate, complete and not misleading.
                  </p>
                  <p>
                    <b>
                      You are not eligible to use our Services (including obtaining a Credential or entering into a user agreement) unless you are at least 18 years old and otherwise have the legal capacity to enter into a binding contract in your jurisdiction.
                    </b>
                  </p>
                  <h4>User Content</h4>
                  <p>
                    <b>
                      Our Services may allow you to access blogs, message boards, chat services, surveys and other forums where various users can share information, opinions, chats and other Content. We generally do not pre-screen or monitor user-submitted Content, and such Content may simply represent a user’s opinion or Content a user finds interesting. Our Services may also include survey results, ratings or testimonials (“Evaluations”) from patients, clients or other customers (“Patients”) of healthcare professionals (“Professionals”) that may endorse, recommend, critique, analyze, evaluate or otherwise describe the Professionals and the nature or quality of the services received by such patient, client or customer. Such Evaluations are anecdotal first-hand accounts of individual Patients, and are neither professional judgments nor the product of medical science. Such Evaluations do not in any way constitute or imply our endorsement or recommendation of any Professional. Further, Evaluations are subject to errors and biases that are common in anecdotal first-hand accounts, and should not to be presumed to be reliable or error-free.
                    </b>
                  </p>
                  <h4>Directories</h4>
                  <p>
                    <b>
                      Our Services may include listings and directories (“Directories”) to help our clients. The Directories are provided for your convenience. The Directories are not comprehensive, but rather generally represent Professionals who use our Services and who have chosen to participate in the Directories. Further, we do not evaluate any Professional and the listing of a Professional does not in any way constitute a recommendation of such Professional. Before obtaining services or treatment from any Professional listed in a Directory, you should take the same care you would under any other circumstance, including by confirming licensure and specialty certifications. The Professionals are solely responsible for the appropriateness and quality of the services they provide. Additionally, the Directories rely on information submitted by Professionals themselves. Unless Professionals provide us with current information, the Directory information may not be timely or accurate. You should confirm such information before obtaining services or treatment from a Professional. As a convenience, the Services may permit you to request an appointment with a Professional. However, Professionals are responsible for maintaining their own schedules, and we cannot ensure that any given Professional will be available, nor that such Professional will not cancel his or her appointment.
                    </b>
                  </p>
                  <h4>No Medical Advice</h4>
                  <p>
                    <b>
                      Some Content may include health- or medical-related information. Such Content is provided for general informational purposes only. We do not directly or indirectly practice medicine, render medical advice, or dispense medical services via our Services or otherwise, and nothing contained in our Services should be intended to be a medical diagnosis or treatment. No medical professional/patient relationship is created by your use of our Services or the Content. Always seek the advice of your physician or other qualified health professional with any questions you may have regarding a medical condition, and never disregard professional medical advice or delay seeking treatment based on any Content or other information included in the Services. If you think you may have a medical emergency, call your healthcare professional or your local emergency number (usually 911) immediately.
                    </b>
                  </p>
                  <h4>Clinical Decision Support Information</h4>
                  <p>
                    <b>
                      If you are a Professional, the Content may include information to assist you in clinical decision-making. This may include information and reminders concerning drug interactions, allergies, dosages, as well as general healthcare related information and resources, such as assessments. We may also provide forums for our users to exchange information. The information and materials available through our Services are for informational purposes only and are not intended to constitute professional advice, diagnosis or treatment, or to substitute for your professional judgment.
                    </b>
                  </p>
                  <h4>No Legal or Regulatory Advice</h4>
                  <p>
                    <b>
                      Some Content may include regulatory related information pertaining to you or your business. Such Content is provided for informational purposes only and as examples only. We are not providing legal or regulatory advice and no attorney/client relationship is created by your use of our Services or the Content. Accordingly, always seek the advice of your attorney or advisor with any questions you may have regarding a law, medical consents, supervision requirements, regulations, or disputes, and things of similar nature.
                    </b>
                  </p>
                  <h4>Public Forums</h4>
                  <p>
                    <b>
                      We may offer one or more forums for the exchange of information among our users. You acknowledge that any text, data, graphics, images, video or other content (“Content”) that you submit in any of our forums (including discussion groups, blogs, surveys, ratings, comment forms, or message boards, collectively, “Public Forums”) is available to the public. Notwithstanding the foregoing, we are under no obligation to display any of your Content that you submit, and we reserve the right to remove or edit your Content at any time, for any or no reason.
                    </b>
                  </p>
                  <p>
                    <b>
                      It is important that you act responsibly when submitting Content to a Public Forum. You acknowledge that any Content that you submit in a Public Forum is available to the public. You are solely responsible for any Content that you post on the Public Forums or transmit to other users of our Services. You acknowledge that any information you post in a Public Forum may be available to the public, and may result in your receiving communications from others outside our Services.
                    </b>
                  </p>
                  <p>
                    <b>
                      You will only disclose information about yourself on a Public Forum that you consider suitable for public disclosure. You will not disclose information that personally identifies you unless you intend for that information to be disclosed publicly. We strongly recommend that you refrain from disclosing any sensitive information about yourself on a Public Forum, including information about any medical condition.
                      You will not violate the privacy rights of others, including disclosing information about anyone else’s medical or financial condition or any other sensitive subjects.
                    </b>
                  </p>
                  <p>
                    <b>
                      You will ensure that any Content that you submit to Public Forums is accurate. If you are rating or reviewing a Professional, you agree to provide your honest appraisals of such Professional, without using inappropriate language or making gratuitous personal criticisms.
                    </b>
                  </p>
                  <p>
                    <b>
                      You will not post any Content that you do not have the right to post; you will not violate any person’s or entity’s intellectual property or proprietary rights, including copyrights, trademarks or trade secret rights.
                    </b>
                  </p>
                  <p>
                    <b>
                      We will not be liable to you for any Content you submit to any Public Forum.
                    </b>
                  </p>
                  <p>
                    <b>
                      You understand and agree that we may, but are not obligated to, monitor, edit or remove any Content for any or no reason at any time. We are not responsible, however, for any delay or failure in removing any Content.
                    </b>
                  </p>
                  <h4>Subscription Term</h4>
                  <p>
                    The term of this Agreement will be either month to month or yearly (“Subscription Term”), depending on which subscription you signed up for in your subscription details tab within your Aesthetic Record account settings. The Subscription Term commences on the Effective Date and will automatically renew on a monthly basis for monthly contracts and on a yearly basis for yearly contracts until either Party terminates in accordance with this Agreement. Either Party may terminate the Agreement and/or any subscription at any time, for any reason or no reason, by providing notice to the other Party at least thirty (30) days before the end of the relevant Subscription Term. Unless otherwise specified in an Order Form, Subscription Fees during any automatic renewal term will revert to the current pricing in effect at the time such renewal term commences.
                  </p>
                  <p>
                    Aesthetic Record may terminate this Agreement and/or any subscription, effective immediately upon notice to you, if you or an Affiliate are in material breach of this Agreement. In the event of a termination pursuant to this section, in addition to other amounts you may owe Aesthetic Record you must immediately pay any unpaid Subscription Fees associated with the remainder of the Subscription Term. In no event will any termination relieve you of your obligation to pay any fees payable to Aesthetic Record for the period prior to the effective date of termination.
                  </p>
                  <p>
                    Upon termination or expiration of this Agreement (a) all Order Forms will automatically terminate and be of no force or effect; (b) you will have no rights to continue use of the Services and will cease accessing and/or using the Services; and (c) except as specified in the following paragraph, Aesthetic Record will have no obligation to maintain your Services account or to retain or forward any data to you or any third party, except as required by applicable law.
                  </p>
                  <p>
                    For a period of no greater than thirty (30) days following a notice of termination, Aesthetic Record will make Your Data available to you through Aesthetic Record. We may suspend or terminate your access to and use of the Services (or any portion thereof) at any time without notice if we believe (a) that any activity or use of Services in connection with your account violates this Agreement, the intellectual property rights of a third party or any applicable laws, or is otherwise disruptive or harmful to Aesthetic Record or any third party, (b) that we are required to do so by law, or (c) where the Parties do not agree on the use of a payment processor.
                  </p>
                  <p>
                    If we reasonably believe any of Your Content violates the law, infringes or misappropriates the rights of any third party or otherwise violates a material term of the Agreement (“Prohibited Content”), we will notify you of the Prohibited Content and may request that such content be removed from the Services or access to it be disabled. If you do not remove or disable access to the Prohibited Content within 2 business days of our notice, we may remove or disable access to the Prohibited Content or suspend the Services to the extent we are not able to remove or disable access to the Prohibited Content. Notwithstanding the foregoing, we may remove or disable access to any Prohibited Content without prior notice in connection with illegal content, where the content may disrupt or threaten the Services, pursuant to the Digital Millennium Copyright Act or as required to comply with law or any judicial, regulatory or other governmental order or request. In the event that we remove content without prior notice, we will provide prompt notice to you unless prohibited by law.
                  </p>
                  <h4>Your Responsibilities</h4>
                  <p>
                    You are responsible for making sure that you, your Affiliates and End Users comply with the terms of this agreement and applicable laws.
                  </p>
                  <p>
                    You are responsible for all activity occurring under or relating to your account, including, but not limited to, your staff, employees, consultants, advisors, independent contractors, and End Users. You will ensure that your Affiliates and End Users comply with all of the provisions of this Agreement, and any applicable local, state, national and foreign laws, including those related to data privacy and transmission of personal data, at all times while using the Services. Any reference in this Agreement to your “access” or “use” of Services (or similar phrase) is deemed to include access or use, as appropriate, by Affiliates and/or End Users, and any act or omission of an Affiliate or End User that does not comply with this Agreement will be deemed a breach of this Agreement by you. You are also responsible for ensuring that you have the appropriate rights to interact and/or contact End Users through the Services, as applicable, in accordance with applicable laws and regulations.
                  </p>
                  <p>
                    You will: (a) have sole responsibility for the accuracy and quality of Your Data and for ensuring that your collection and use of Your Data complies with applicable laws, including those related to data privacy and transmission of personal data; (b) prevent unauthorized access to, or use of, the Services, and notify Aesthetic Record promptly of any unauthorized access or use; and (c) have sole responsibility for obtaining, maintaining and paying for any hardware, telecommunications, Internet and other services needed to use the Services.
                  </p>
                  <p>
                    You and your Affiliates and End Users will not: (i) submit any infringing, obscene, defamatory, threatening, or otherwise unlawful or tortious material to the Services, including material that violates privacy rights; (ii) interfere with or disrupt the integrity or performance of the Services or the data contained therein; (iii) attempt to gain access to the Services or related systems or networks in a manner not permitted by this Agreement; (iv) post, transmit or otherwise make available through or in connection with the Services any virus, worm, Trojan horse, Easter egg, time bomb, spyware or other harmful computer code, files, scripts agents or programs; (v) restrict or inhibit any other person or entity from using the Services; (vi) remove any copyright, trademark or other proprietary rights notice from the Services; (vii) frame or mirror any portion of the Services, or otherwise incorporate any portion of the Services into any product or service; (viii) systematically download and store Services content; or (ix) use any robot, spider, site search/retrieval application or other manual or automatic device to retrieve, index, “scrape,” “data mine” or otherwise gather Services content, or reproduce or circumvent the navigational structure or presentation of the Services.
                  </p>
                  <p>
                    You are liable if any Cardholder Data is mishandled under your account. You are solely responsible for any liability resulting from your or any Affiliate’s handling of Cardholder Data. You agree that you and Affiliates will comply with PCI DSS anytime the Services are used to process credit cards.
                  </p>
                  <p>
                    You will ensure all user names and passwords are kept confidential. Aesthetic Record may reject or require that you change any user name or password under your account. User names and passwords are for internal business use only and may not be shared with any third party, including any competitor of Aesthetic Record. You, and not Aesthetic Record are responsible for any use or misuse of user names or passwords associated with your account. Sharing one user name and one password among two or more people is a violation of this Agreement.
                  </p>
                  <p>
                    Customer shall obtain and maintain all necessary licences and consents and comply with all applicable laws in relation to the Services before the date on which the Services are to start.
                  </p>
                  <p>
                    Customer shall respond promptly to any Service Provider request to provide direction, information, approvals, authorizations or decisions that are reasonably necessary for Service Provider to perform Services in accordance with the requirements of this Agreement.
                  </p>
                  <p>
                    Customer shall be responsible for all sales, use and excise taxes, and any other similar taxes, duties and charges of any kind imposed by any federal, state or local governmental entity on any amounts payable by Customer hereunder.
                  </p>
                  <p>
                    If Service Provider’s performance of its obligations under this Agreement is prevented or delayed by any act or omission of Customer or its agents, subcontractors, consultants or employees, Service Provider shall not be deemed in breach of its obligations under this Agreement or otherwise liable for any costs, charges or losses sustained or incurred by Customer, in each case, to the extent arising directly or indirectly from such prevention or delay.
                  </p>
                  <h4>Payment</h4>
                  <p>
                    Fees for the subscribed Software Services (“Subscription Fees”) are set forth on our website. This describes our fees and your payment obligations. All fees are non-refundable and must be paid in advance.
                  </p>
                  <p>
                    <b>
                      Your payment to Aesthetic Record will automatically renew at the end of the subscription period unless you cancel your subscription through your subscription page before the end of the current subscription period. The cancellation will take effect the day after the last day of the current subscription period. However, if you cancel your payment or subscription and/or terminate any of the agreements before the end of the current subscription period, we will not refund any subscription fees already paid to us.
                    </b>
                  </p>
                  <p>
                    You agree to pay Aesthetic Record the Subscription Fees and any other applicable fees stated on an order form or otherwise specified in this Agreement. All payment obligations under this Agreement are non-cancelable and all fees paid are non-refundable. Fees must be paid in advance of each billing period.
                  </p>
                  <p>
                    You will provide Aesthetic Record with valid and updated credit card information or another form of payment acceptable to Aesthetic Record. If you provide credit card information, you represent that you are authorized to use the card and you authorize Aesthetic Record to charge the card for all payments hereunder. By submitting payment information, you authorize Aesthetic Record to provide that information to third parties for purposes of facilitating payment. You agree to verify any information requested by Aesthetic Record for purposes of acknowledging or completing any payment.
                  </p>
                  <p>
                    Any amounts not received by the applicable due date may accrue late interest at 1.5% of the outstanding balance per month, or the maximum interest permitted by applicable law, whichever is less, plus costs of collection. Any amount not received by Aesthetic Record within thirty (30) days after the applicable due date will be deemed a material default under this Agreement, and Aesthetic Record will be entitled to either suspend the Services or terminate the Agreement.
                  </p>
                  <p>
                    In addition to any remedies that may be provided under this Agreement, Service Provider may terminate this Agreement with immediate effect upon written notice to Customer, if Customer:
                  </p>
                  <p>
                    (a)  has not otherwise performed or complied with any of the terms of this Agreement, in whole or in part; or
                  </p>
                  <p>
                    (b)  becomes insolvent, files a petition for bankruptcy or commences or has commenced against it proceedings relating to bankruptcy, receivership, reorganization or assignment for the benefit of creditors.
                  </p>
                  <p>
                    Upon notice to you, Aesthetic Record may increase any fees specified in an order form or on our website, provided the increase will not become effective until the expiration of the current Subscription Term. Aesthetic Record may increase any fees that are not specified in an order form at any time, with or without notice to you. Aesthetic Record may also convert any free, trial or beta Service into a Service subject to a Subscription Fee upon notice to you, and your rights to such Service will be suspended if you do not pay the Subscription Fee.
                  </p>
                  <p>
                    <b>
                      Aesthetic Record will communicate any price changes to you in advance and, if applicable, how to accept those changes. Price changes for subscriptions will take effect at the start of the next subscription period following the date of the price change. As permitted by local law, you accept the new price by continuing to use Aesthetic Record after the price change takes effect. If you do not agree with the price changes, you have the right to reject the change by canceling your Aesthetic Record account prior to the price change going into effect.
                    </b>
                  </p>
                  <p>
                    Fees do not include any taxes, levies, duties or similar governmental assessments of any nature, including, for example, value-added, sales, use or withholding taxes, assessable by any jurisdiction (collectively, “Taxes”). You are responsible for paying all Taxes associated with purchases and transactions under this Agreement. If Aesthetic Record is legally required to pay or collect any Taxes on your behalf, Aesthetic Record will invoice you and you will pay the invoiced amount. You acknowledge that we may make certain reports to tax authorities (e.g., 1099 forms) regarding transactions that we process and merchants to which we provide Payment Processing Services.
                  </p>
                  <h4>Intellectual Property</h4>
                  <p>
                    All intellectual property rights, including copyrights, patents, patent disclosures and inventions (whether patentable or not), trademarks service marks, trade secrets, know-how and other confidential information, trade dress, trade names, logos, corporate names and domain names, together with all of the goodwill associated therewith, derivative works and all other rights (collectively, “Intellectual Property Rights”) in and to all documents, work product and other materials that are delivered to Customer under this Agreement or prepared by or on behalf of the Service Provider in the course of performing the Services (collectively, the <b>“Deliverables”</b>) except for any Confidential Information of Customer or customer materials shall be owned by Service Provider. Service Provider hereby grants Customer a personal license to use all Intellectual Property Rights free of additional charge and on a non-exclusive, worldwide, non-transferable, non-sublicenseable, fully paid-up, royalty-free and perpetual basis to the extent necessary to enable Customer to make reasonable use of the Deliverables and the Services.
                  </p>
                  <p>
                    This license is for the sole purpose of enabling you to use and enjoy the benefit of the Services as provided by Aesthetic Record, in the manner permitted by these terms. You may not copy, modify, distribute, sell, or lease any part of our Services or included software, nor may you reverse engineer or attempt to extract the source code of that software, unless laws prohibit those restrictions or you have our written permission.
                  </p>
                  <h4>Confidential Information</h4>
                  <p>
                    All non-public, confidential or proprietary information of Service Provider, including, but not limited to, trade secrets, technology, information pertaining to business operations and strategies, and information pertaining to customers, pricing, and marketing (collectively, “Confidential Information”), disclosed by Service Provider to Customer, whether disclosed orally or disclosed or accessed in written, electronic or other form or media, and whether or not marked, designated or otherwise identified as “confidential,” in connection with the provision of the Services and this Agreement is confidential, and shall not be disclosed or copied by Customer without the prior written consent of the Service Provider. Confidential Information does not include information that is (i)   in the public domain; (ii)  known to Customer at the time of disclosure; or (iii)  rightfully obtained by Customer on a non-confidential basis from a third party. Customer agrees to use the Confidential Information only to make use of the Services and Deliverables. Service Provider shall be entitled to injunctive relief for any violation of this Section.
                  </p>
                  <h4>Representations and Warranties</h4>
                  <p>
                    Service Provider represents and warrants to Customer that it shall perform the Services using personnel of required skill, experience and qualifications and in a professional and workmanlike manner in accordance with generally recognized industry standards for similar services and shall devote adequate resources to meet its obligations under this Agreement.
                  </p>
                  <p>
                    The Service Provider shall not be liable for a breach of the warranty set forth in this Section unless Customer gives written notice of the defective Services, reasonably described, to Service Provider within 5 days of the time when Customer discovers or ought to have discovered that the Services were defective. Service Provider shall, in its sole discretion, either: (i)  repair or re-perform such Services (or the defective part); or (ii)  credit or refund the price of such Services at the pro rata contract rate.<b> THE REMEDIES SET FORTH IN THIS SECTION SHALL BE THE CUSTOMER’S SOLE AND EXCLUSIVE REMEDY AND SERVICE PROVIDER’S ENTIRE LIABILITY FOR ANY BREACH OF THE LIMITED WARRANTY SET FORTH IN THIS SECTION</b>
                  </p>
                  <p>
                    <b>
                      EXCEPT FOR THE WARRANTY SET FORTH IN SECTION 11(A) ABOVE, SERVICE PROVIDER MAKES NO WARRANTY WHATSOEVER WITH RESPECT TO THE SERVICES, INCLUDING ANY (A) WARRANTY OF MERCHANTABILITY; OR (B) WARRANTY OF FITNESS FOR A PARTICULAR PURPOSE; OR (C) WARRANTY OF TITLE; OR (D) WARRANTY AGAINST INFRINGEMENT OF INTELLECTUAL PROPERTY RIGHTS OF A THIRD PARTY; WHETHER EXPRESS OR IMPLIED BY LAW, COURSE OF DEALING, COURSE OF PERFORMANCE, USAGE OF TRADE OR OTHERWISE.
                    </b>
                  </p>
                  <h4>Indemnification</h4>
                  <p>
                    You agree to indemnify, defend, and hold harmless Aesthetic Record and its affiliates from and against any and all third party claims alleged or asserted against any of them, and all related charges, damages and expenses (including, but not limited to, reasonable attorneys' fees and costs) arising from or relating to: (a) any actual or alleged breach by you, an Affiliate or End User of any provisions of this Agreement; (b) any access to or use of the Services by you, an Affiliate or End User; (c) any actual or alleged violation by you, an Affiliate or End User of the intellectual property, privacy or other rights of a third party; (d) any dispute between you and another party regarding ownership of or access to Your Data; or (e) any alleged or actual violation of any law by you or any of your End Users or Affiliates.
                  </p>
                  <h4>Notices</h4>
                  <p>
                    Any notices provided by Aesthetic Record under this Agreement may be delivered to you within the Services or to the email address(es) we have on file for your account. You hereby consent to receive notice from Aesthetic Record through the foregoing means, and such notices will be deemed effective when sent if on a business day, and if not sent on a business day then on the next business day. Except as otherwise specified in the Agreement, any notices to Aesthetic Record under this Agreement must be delivered via first class registered U.S. mail, overnight courier, to Aesthetic Record, 40 West Gay Street, 3rd Floor, Columbus, OH 43215.
                  </p>
                  <h4>Electronic Communications and Signatures</h4>
                  <p>
                    You agree to the use of electronic communication in order to enter into agreements and place orders, and to the electronic delivery of notices, policies and records of transactions initiated or completed through the Services. Furthermore, you hereby waive any rights or requirements under any laws or regulations in any jurisdiction that require an original (non-electronic) signature or delivery or retention of non-electronic records, to the extent permitted under applicable law.<b> YOU ACKNOWLEDGE THAT YOUR ELECTRONIC SUBMISSIONS CONSTITUTE YOUR AGREEMENT AND INTENT TO BE BOUND BY SUCH AGREEMENTS AND TRANSACTIONS. YOUR AGREEMENT AND INTENT TO BE BOUND BY ELECTRONIC SUBMISSIONS APPLIES TO ALL RECORDS RELATING TO ALL TRANSACTIONS YOU ENTER INTO ON THE SERVICES, INCLUDING NOTICES OF CANCELLATION, POLICIES, CONTRACTS, AND APPLICATIONS.</b>
                  </p>
                  <h4>HIPAA</h4>
                  <p>
                    The Health Insurance Portability and Accountability Act of 1996 (“HIPAA”) imposes rules to protect certain Personal Health Information (PHI) as that term is defined under HIPAA. If you or any Affiliate is subject to HIPAA, and providing or processing any PHI in connection with the Services, prior to accessing or using the services you must notify Aesthetic Record and enter into a Business Associate Agreement (“BAA”) in the form provided by Aesthetic Record. You are solely responsible for determining whether you or any affiliates are subject to HIPAA.
                  </p>
                  <p>
                    <b>
                      During the subscription term, Aesthetic Record will maintain administrative, physical and technical safeguards designed for the protection and integrity of Your Data.
                    </b>
                  </p>
                  <p>
                    <b>
                      In the United States, records may be securely deleted by Aesthetic Record after 90 days of inactivity or 90 days after the account not being in good standing or being terminated, whichever is sooner.
                    </b>
                  </p>
                  <p>
                    <b>
                      In the event of a termination by Customer, Customer acknowledges that is their responsibility to maintain a complete medical record for their client under HIPAA. Aesthetic Record agrees to make Customer’s records available to them at no cost for 30 days after the end of their subscription to allow them to transfer the PHI in a HIPAA compliant manner. Aesthetic Record does not provide any data retrieval / export services, the data must be retrieved by the Customer during the subscription term.
                    </b>
                  </p>
                  <p>
                    <b>
                      For general support and tech support purposes when our Customers contact us for support, we access their Aesthetic Record dashboard and all screens related to their support inquiry to help them identify and solve issues.
                    </b>
                  </p>
                  <p>
                    <b>
                      If either party believes that there has been a disclosure of Your Data in a manner not authorized under this agreement, such party will promptly notify the other party. Additionally, each party will reasonably assist the other party in remediating or mitigating any potential damage, including any notification which should be sent to individuals impacted or potentially impacted by such unauthorized disclosure.
                    </b>
                  </p>
                  <p>
                    <b>
                      We are not responsible for resolving or intervening in any dispute over Your Data or your business practices. You are solely responsible for resolving disputes regarding ownership or access to Your Data, including those involving any current or former owners, co-owners, employees or contractors of your business. You acknowledge and agree that Aesthetic Record has no obligation whatsoever to resolve or intervene in such disputes.
                    </b>
                  </p>
                  <p>
                    <b>
                      Customer will not request, direct, or cause Aesthetic Record to use or disclose PHI unless the use or disclosure is in compliance with applicable law relating to the privacy and security of patient data and is the minimum amount necessary for the legitimate purpose of such use or disclosure;
                    </b>
                  </p>
                  <p>
                    <b>
                      Aesthetic Record’s use and disclosure of Client PHI is permitted for the following purposes:<br />
                      (a) to provide Services;<br />
                      (b) as expressly permitted in the Agreement;<br />
                      (c) as required by law or a subpoena;<br />
                      (d) to provide data aggregation services;<br />
                      (e) for the proper management and administration of Aesthetic Record, including, without limitation, making and maintaining reasonable business records of transactions in which Aesthetic Record has participated or Aesthetic Record has been used (including back-up documentation); <br />
                      (f) to provide tech support related to the services; and<br />
                      (g) to de-identify Client PHI and use such de-identified information.
                    </b>
                  </p>
                  <h4>Disclaimer</h4>
                  <p>
                    <b>
                      EXCEPT AS EXPRESSLY PROVIDED IN THIS AGREEMENT, TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, AESTHETIC RECORD MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE, AND SPECIFICALLY DISCLAIMS ALL IMPLIED WARRANTIES, INCLUDING WITHOUT LIMITATION ANY WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE WITH RESPECT TO THE SERVICES AND/OR RELATED DOCUMENTATION. AESTHETIC RECORD DOES NOT WARRANT THAT YOUR USE OF THE SERVICES WILL BE SECURE, TIMELY, ERROR-FREE OR UNINTERRUPTED, OR THAT THE SERVICES ARE OR WILL REMAIN UPDATED, COMPLETE OR CORRECT, OR THAT THE SERVICES WILL MEET YOUR REQUIREMENTS OR THAT THE SYSTEMS THAT MAKE THE SERVICES AVAILABLE (INCLUDING WITHOUT LIMITATION THE INTERNET, OTHER TRANSMISSION NETWORKS, AND YOUR LOCAL NETWORK AND EQUIPMENT) WILL BE UNINTERRUPTED OR FREE FROM VIRUSES OR OTHER HARMFUL COMPONENTS. EXCEPT AS PROVIDED IN HEREIN THE SERVICES AND ANY PRODUCTS AND THIRD PARTY MATERIALS ARE PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS AND SOLELY FOR YOUR USE IN ACCORDANCE WITH THIS AGREEMENT. ALL DISCLAIMERS OF ANY KIND (INCLUDING IN THIS SECTION AND ELSEWHERE IN THIS AGREEMENT) ARE MADE ON BEHALF OF BOTH AESTHETIC RECORD AND ITS AFFILIATES AND THEIR RESPECTIVE SHAREHOLDERS, DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES, AGENTS, REPRESENTATIVES, CONTRACTORS, LICENSORS, SUPPLIERS AND SERVICE PROVIDERS.
                    </b>
                  </p>
                  <h4>Limitation of Liability</h4>
                  <p>
                    <b>
                      IN NO EVENT SHALL SERVICE PROVIDER BE LIABLE TO CUSTOMER OR TO ANY THIRD PARTY FOR ANY LOSS OF USE, REVENUE OR PROFIT [OR LOSS OF DATA OR DIMINUTION IN VALUE], OR FOR ANY CONSEQUENTIAL, INCIDENTAL, INDIRECT, EXEMPLARY, SPECIAL OR PUNITIVE DAMAGES WHETHER ARISING OUT OF BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE) OR OTHERWISE, REGARDLESS OF WHETHER SUCH DAMAGES WERE FORESEEABLE AND WHETHER OR NOT SERVICE PROVIDER HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, AND NOTWITHSTANDING THE FAILURE OF ANY AGREED OR OTHER REMEDY OF ITS ESSENTIAL PURPOSE.
                    </b>
                  </p>
                  <p>
                    <b>
                      IN NO EVENT SHALL SERVICE PROVIDER’S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT, WHETHER ARISING OUT OF OR RELATED TO BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE) OR OTHERWISE, EXCEED THE AGGREGATE AMOUNTS PAID OR PAYABLE TO SERVICE PROVIDER PURSUANT TO THIS AGREEMENT IN THE 6 MONTH PERIOD PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
                    </b>
                  </p>
                  <p>
                    The limitation of liability set forth above shall not apply to (i) liability resulting from Service Provider’s gross negligence or willful misconduct and (ii) death or bodily injury resulting from Service Provider’s gross negligent acts or gross negligent omissions.
                  </p>
                  <h4>Insurance</h4>
                  <p>
                    <b>
                      During the term of this Agreement, Customer shall, at its own expense, maintain and carry insurance in full force and effect which includes, but is not limited to, commercial general liability (including product liability) in a sum no less than $1,000,000 with financially sound and reputable insurers. Upon Service Provider’s request, Customer shall provide Service Provider with a certificate of insurance from Customer’s insurer evidencing the insurance coverage specified in these Terms. Customer shall provide Service Provider with 5 days’ advance written notice in the event of a cancellation or material change in Customer’s insurance policy.
                    </b>
                  </p>
                  <h4>Waiver</h4>
                  <p>
                    <b>
                      No waiver by Service Provider of any of the provisions of this Agreement is effective unless explicitly set forth in writing and signed by Service Provider. No failure to exercise, or delay in exercising, any rights, remedy, power or privilege arising from this Agreement operates or may be construed as a waiver thereof. No single or partial exercise of any right, remedy, power or privilege hereunder precludes any other or further exercise thereof or the exercise of any other right, remedy, power or privilege.
                    </b>
                  </p>
                  <h4>Force Majeure</h4>
                  <p>
                    <b>
                      The Service Provider shall not be liable or responsible to Customer, nor be deemed to have defaulted or breached this Agreement, for any failure or delay in fulfilling or performing any term of this Agreement when and to the extent such failure or delay is caused by or results from acts or circumstances beyond the reasonable control of Service Provider including, without limitation, acts of God, flood, fire, earthquake, explosion, governmental actions, war, invasion or hostilities (whether war is declared or not), terrorist threats or acts, riot, or other civil unrest, national emergency, revolution, insurrection, epidemic, lock-outs, strikes or other labor disputes (whether or not relating to either party’s workforce), or restraints or delays affecting carriers or inability or delay in obtaining supplies of adequate or suitable materials, materials or telecommunication breakdown or power outage.
                    </b>
                  </p>
                  <h4>Assignment</h4>
                  <p>
                    <b>
                      Customer shall not assign any of its rights or delegate any of its obligations under this Agreement without the prior written consent of Service Provider. Any purported assignment or delegation in violation of this Section is null and void. No assignment or delegation relieves Customer of any of its obligations under this Agreement.
                    </b>
                  </p>
                  <h4>Relationship of the Parties</h4>
                  <p>
                    <b>
                      The relationship between the parties is that of independent contractors. Nothing contained in this Agreement shall be construed as creating any agency, partnership, joint venture or other form of joint enterprise, employment or fiduciary relationship between the parties, and neither party shall have authority to contract for or bind the other party in any manner whatsoever.
                    </b>
                  </p>
                  <h4>Jurisdiction and Governing Law</h4>
                  <p>
                    <b>
                      Any legal suit, action or proceeding arising out of or relating to this Agreement shall be instituted in the federal courts of the United States of America or the courts of the State of Ohio in each case located in the City of Columbus and County of Franklin, and each party irrevocably submits to the exclusive jurisdiction of such courts in any such suit, action or proceeding.
                    </b>
                  </p>
                  <p>
                    <b>
                      All matters arising out of or relating to this Agreement are governed by and construed in accordance with the internal laws of the State of Ohio without giving effect to any choice or conflict of law provision or rule (whether of the State of Ohio or any other jurisdiction) that would cause the application of the laws of any jurisdiction other than those of the State of Ohio.
                    </b>
                  </p>
                  <h4>Severability</h4>
                  <p>
                    <b>
                      If any term or provision of this Agreement is invalid, illegal or unenforceable in any jurisdiction, such invalidity, illegality or unenforceability shall not affect any other term or provision of this Agreement or invalidate or render unenforceable such term or provision in any other jurisdiction.
                    </b>
                  </p>
                </Scrollbars>
              </div>
              <div className="member-section-footer">
							  <button type="button" className="agree-btn" onClick={this.handleAccept}>{this.props.globalLang.signup_button_accept}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
