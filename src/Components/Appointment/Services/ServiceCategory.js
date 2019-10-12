import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getServiceCategories, exportEmptyData } from '../../../Actions/Appointment/appointmentAction.js';
import { Link } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ToastContainer, toast } from "react-toastify";
import { updateSortOrder } from "../../../Actions/Settings/settingsActions.js";
import AppointmentHeader from '../AppointmentHeader.js'
import { checkIfPermissionAllowed} from '../../../Utils/services.js';

class ServiceCategory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            serviceCatList: [],
            page: 1,
            pagesize: 15,
            sortorder: "asc",
            term: "",
            hasMoreItems: true,
            next_page_url: "",
            showLoadingText: false,
            loadMore: true,
            startFresh: true,
            showLoader: false,
            next_page_url: '',
        }
        localStorage.setItem('loadFresh', false);
        localStorage.setItem('sortOnly', false);

        window.onscroll = () => {
            const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
            if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.next_page_url != null) {
                this.loadMore();
            }
        };
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;

        this.setState({
            [event.target.name]: value
        });

        if (event.target.name === 'object_name') {
            this.handleSubmit(event, value)
        }
    }



    componentDidMount() {
        const languageData = JSON.parse(localStorage.getItem('languageData'));
        this.setState({
            appointment_service_category_create_service_category: languageData.appointments['appointment_service_category_create_service_category'],
            appointment_service_category_category_name: languageData.appointments['appointment_service_category_category_name'],
            appointment_service_category_no_of_services: languageData.appointments['appointment_service_category_no_of_services'],
            label_active: languageData.global['label_active'],
            label_yes: languageData.global['label_yes'],
            label_no: languageData.global['label_no'],
            label_edit: languageData.global['label_edit'],
            label_search: languageData.global['label_search'],
            loading_please_wait_text: languageData.global['loading_please_wait_text'],
            Please_Wait: languageData.global['Please_Wait'],
            sorry_no_record_found: languageData.global['sorry_no_record_found'],
        });
        let formData = {
            params: {
                page: this.state.page,
                pagesize: this.state.pagesize,
                sortorder: "asc",
                term: this.state.term,
            }
        };
        this.setState({ 'showLoader': true });
        this.props.getServiceCategories(formData);
    }

    loadMore = () => {
        localStorage.setItem("sortOnly", false);
        this.setState({ loadMore: true, startFresh: true, showLoader: true, showLoadingText: true });
        let formData = {
            params: {
                page: this.state.page,
                pagesize: this.state.pagesize,
                term: this.state.term
            }
        };
        this.setState({ 'showLoader': true });
        this.props.getServiceCategories(formData);
    };

    /* componentWillUnmount = () => {
      window.onscroll = () => {
        return false;
      }
     }*/

    static getDerivedStateFromProps(nextProps, prevState) {
        let returnState = {};
        if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
            returnState.showLoader = false;
            nextProps.exportEmptyData();
            return returnState;
        } else if (nextProps.serviceCatList != undefined && nextProps.serviceCatList.next_page_url !== prevState.next_page_url) {

            let returnState = {};
            if (prevState.next_page_url == null) {
                localStorage.setItem("sortOnly", false);
                returnState.next_page_url = null;
                return returnState;
            }
            if (prevState.serviceCatList.length == 0 && prevState.startFresh == true) {
                if (localStorage.getItem("sortOnly") == "false") {
                    returnState.serviceCatList = nextProps.serviceCatList.data;
                    if (nextProps.serviceCatList.next_page_url != null) {
                        returnState.page = prevState.page + 1;
                    } else {
                        returnState.next_page_url = nextProps.serviceCatList.next_page_url;
                    }
                    returnState.startFresh = false;
                    returnState.showLoader = false;
                    returnState.showLoadingText = false;
                    localStorage.setItem('showLoader', false);
                    nextProps.exportEmptyData();
                } else {
                    localStorage.setItem("sortOnly", false);
                }
            } else if (prevState.serviceCatList != nextProps.serviceCatList.data &&
                prevState.serviceCatList.length != 0) {
                returnState.serviceCatList = [
                    ...prevState.serviceCatList,
                    ...nextProps.serviceCatList.data
                ];
                returnState.page = prevState.page + 1;
                returnState.next_page_url = nextProps.serviceCatList.next_page_url;
                localStorage.setItem('showLoader', false);
                returnState.showLoader = false;
                returnState.showLoadingText = false;
                nextProps.exportEmptyData();
            }
            return returnState;
        }
        return null;

    }

    reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    getItemStyle = (isDragging, draggableStyle) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: "none",

        // change background colour if dragging
        background: isDragging ? "#f7fbfd" : "ffffff",

        // styles we need to apply on draggables
        ...draggableStyle
    });

    reOrderList = list => {
        let formData = {
            object_ids: list
        };
        let serviceCatList = list.map((obj, idx) => {
            const serviceCat = this.state.serviceCatList.filter(x => x.id === obj)
            if (serviceCat.length === 1) {
                return serviceCat[0];
            }
        });
        this.setState({ serviceCatList: serviceCatList })
        this.props.updateSortOrder(formData, "ServiceCategory");
    };

    ServiceCategoryEdit = id => {
        return <div>{this.props.history.push(`/appointment/service-category/${id}/edit`)}</div>;
    };

    ServiceCategoryList = (id, event) => {
        if (event.target.className != 'easy-link') {
            return <div>{this.props.history.push(`/appointment/services/${id}`)}</div>;
        }
        return;
    };

    handleSubmit = event => {
        localStorage.setItem("sortOnly", false);
        event.preventDefault();
        //localStorage.setItem("sortOnly", true);
        let formData = {
            params: {
                page: 1,
                pagesize: this.state.pagesize,
                term: this.state.term,
            }
        };
        this.setState({
            page: 1,
            pagesize: this.state.pagesize,
            startFresh: true,
            loadMore: true,
            startFresh: true,
            next_page_url: "",
            serviceCatList: [],
            next_page_url: ''
        });
        this.setState({ 'showLoader': true });
        this.props.getServiceCategories(formData);
    };

    render() {
        var list = [];
        if (this.state.serviceCatList !== undefined) {
            list = this.state.serviceCatList.map((obj, idx) => {
                return {
                    content: (
                        <React.Fragment key={'fragment_' + obj.id}>
                            <td className="col-xs-6 table-updated-td Questionnaire-name"><a href="javascript:void(0);" className="drag-dots"></a>{obj.name}</td>
                            <td className="col-xs-2 table-updated-td">{obj.service_category_assoc_count}</td>
                            <td className="col-xs-2 table-updated-td">{(obj.is_active) ? this.state.label_yes : this.state.label_no}</td>
                            <td className="col-xs-2 table-updated-td" ><a href="javascript:void(0);" onClick={this.ServiceCategoryEdit.bind(this, obj.id)} className="easy-link">{this.state.label_edit}</a></td>
                        </React.Fragment>
                    ),
                    id: obj.id
                };
            });
        }

        var onDragEnd = result => {
            // dropped outside the list
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

        return (<div id="content">
            <div className="container-fluid content setting-wrapper">
                <AppointmentHeader activeMenuTag={'service-category'} />
                <div className="juvly-section full-width">
                    <div className="setting-search-outer">
                        <form onSubmit={this.handleSubmit}>
                            <div className="search-bg new-search">
                                <i className="fas fa-search" />
                                <input className="setting-search-input search-key" autoComplete="off" name="term" placeholder={this.state.label_search} value={this.state.term} onChange={this.handleInputChange} />
                            </div>
                        </form>
                        {checkIfPermissionAllowed("manage-services") &&
                          <Link to="/appointment/service-category/create" className="new-blue-btn pull-right">{this.state.appointment_service_category_create_service_category}</Link>
                        }
                    </div>
                    <div className="table-responsive">
                        <table className="table-updated juvly-table table-min-width">
                            <thead className="table-updated-thead">
                                <tr>
                                    <th className="col-xs-6 table-updated-th">{this.state.appointment_service_category_category_name}</th>
                                    <th className="col-xs-2 table-updated-th">{this.state.appointment_service_category_no_of_services}</th>
                                    <th className="col-xs-2 table-updated-th">{this.state.label_active}</th>
                                    <th className="col-xs-2 table-updated-th">&nbsp;</th>
                                </tr>
                            </thead>
                            {list.length > 0 ?
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="droppable">
                                        {(provided, snapshot) => (<tbody ref={provided.innerRef}>
                                            {list.map((item, index) => (<Draggable key={item.id} draggableId={item.id} index={index}>
                                                {
                                                    (provided, snapshot) => (
                                                        <tr className="table-updated-tr" data-order_by={item.id} onClick={this.ServiceCategoryList.bind(this, item.id)} ref={provided.innerRef}{...provided.draggableProps}{...provided.dragHandleProps}
                                                            style={this.getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
                                                            {item.content}
                                                        </tr>)
                                                }
                                            </Draggable>))}{null}{provided.placeholder}</tbody>)}
                                    </Droppable>
                                </DragDropContext>
                                :
                                <tbody>
                                    <tr className="table-updated-tr">
                                        <td className="col-xs-12 table-updated-td text-center" colSpan="7">{this.state.sorry_no_record_found}</td>
                                    </tr>
                                </tbody>
                            }
                        </table>
                    </div>
                    <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                        <div className="loader-outer">
                            <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                            <div id="modal-confirm-text" className="popup-subtitle" >{this.state.Please_Wait}</div>
                        </div>
                    </div>
                </div>
                <div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display"}>{this.state.loading_please_wait_text}</div>
            </div>
        </div>
      );
    }
}

function mapStateToProps(state) {
    let returnState = {}
    const languageData = JSON.parse(localStorage.getItem("languageData"));
    if (state.AppointmentReducer.action === 'SERVICE_CAT_LIST') {
        if (state.AppointmentReducer.data.status != 200) {
            toast.dismiss();
            toast.error(languageData.global[state.AppointmentReducer.data.message]);
            returnState.showLoader = false
        } else {
            returnState.serviceCatList = state.AppointmentReducer.data.data;
        }
    } else if (state.SettingReducer.action === "SORT_ORDER_UPDATE") {
        if (state.SettingReducer.data.status == 200) {
            toast.dismiss();
            toast.success(languageData.global[state.SettingReducer.data.message]);
        } else {
            toast.dismiss();
            toast.error(languageData.global[state.SettingReducer.data.message]);
            returnState.showLoader = false
        }
        return {};
    }
    return returnState;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ getServiceCategories: getServiceCategories, updateSortOrder: updateSortOrder, exportEmptyData: exportEmptyData }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ServiceCategory);
