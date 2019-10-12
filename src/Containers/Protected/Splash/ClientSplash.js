import React, { Component } from "react";


class ClientSplash extends Component {
  constructor(props) {
    super(props);
    
  }




  render() {
    return (
      <div id="content">
    <div className="container-fluid content setting-wrapper wrapper-cell">

        <div className="loader-outer no-display" id="patient-loader"><img src="/images/Eclipse.gif" className="loader-img" /></div>

        <div className="client-filter">
            <div className="filter-outer">
                <div className="row">

                    <div className="total-patients col-sm-4">
                        <div className="text-line full-width"></div>
                    </div>

                    <div className="col-sm-5 text-center srch-outer srch-wid-alpha">
                        <div className="text-line full-width"></div>
                    </div>

                    <div className="col-sm-3 right-create-patient">
                        <div className="text-line pull-right"></div>
                        <div className="text-line pull-right"></div>
                    </div>

                </div>

                <div className="dropdown add-field profile-toggler">
                    <ul className="dropdown-menu add-field-list">
                            <li>
                                <input type="checkbox" id="user_image" name="user_image" />
                                <label htmlFor="user_image">Profile Photo</label>
                            </li>
                            <li>
                                <input type="checkbox" id="firstname" name="firstname" checked="checked" disabled="disabled" />
                                <label htmlFor="firstname">First Name</label>
                            </li>
                            <li>
                                <input type="checkbox" id="lastname" name="lastname" checked="checked" disabled="disabled" />
                                <label htmlFor="lastname">Last Name</label>
                            </li>
                            <li>
                                <input type="checkbox" id="email" name="email"  />
                                <label htmlFor="email">Email</label>
                            </li>
                            <li>
                                <input type="checkbox" id="phoneNumber" name="phoneNumber"  />
                                <label htmlFor="phoneNumber">Phone</label>
                            </li>
                            <li>
                                <input type="checkbox" id="phoneNumber_2" name="phoneNumber_2" />
                                <label htmlFor="phoneNumber_2">Phone 2</label>
                            </li>
                            <li>
                                <input type="checkbox" id="gender" name="gender" />
                                <label htmlFor="gender">Gender</label>
                            </li>
                            <li>
                                <input type="checkbox" id="date_of_birth" name="date_of_birth" />
                                <label htmlFor="date_of_birth">DOB</label>
                            </li>
                            <li>
                                <input type="checkbox" id="address_line_1" name="address_line_1" />
                                <label htmlFor="address_line_1">Address Line 1</label>
                            </li>
                            <li>
                                <input type="checkbox" id="address_line_2" name="address_line_2" />
                                <label htmlFor="address_line_2">Address Line 2</label>
                            </li>
                            <li>
                                <input type="checkbox" id="city" name="city" />
                                <label htmlFor="city">City</label>
                            </li>
                            <li>
                                <input type="checkbox" id="state" name="state" />
                                <label htmlFor="state">State</label>
                            </li>
                            <li>
                                <input type="checkbox" id="zipcode" name="zipcode" />
                                <label htmlFor="zipcode">Zip#</label>
                            </li>
                            <li>
                                <input type="checkbox" id="country" name="country" />
                                <label htmlFor="country">Country</label>
                            </li>
                            <li>
                                <input type="checkbox" id="last_visit" name="last_visit"  />
                                <label htmlFor="last_visit">Visited</label>
                            </li>
                            <li>
                                <input type="checkbox" id="is_fired" name="is_fired"  />
                                <label htmlFor="is_fired">Fired</label>
                            </li>
                            <li>
                                <input type="checkbox" id="nick_name" name="nick_name"  />
                                <label htmlFor="nick_name">Nick Name</label>
                            </li>
                    </ul>
                </div>

                <ul className="patient-alpha profile-toggler">
                    <div className="text-line half-width no-margin pull-right"></div>
                </ul>

                <table className="table-updated juvly-table desktop-patient-head clients-table profile-toggler wrapper-cell">
                    <thead className="table-updated-thead desktop-patient-head">
                        <tr>
                            <th className="table-updated-th sorting text">
                                <div className="text-line"></div>
                            </th>
                            <th className="table-updated-th sorting text">
                                <div className="text-line"></div>
                            </th>
                            <th className="table-updated-th sorting text">
                                <div className="text-line"></div>
                            </th>
                            <th className="table-updated-th text">
                                <div className="text-line"></div>
                            </th>
                        </tr>
                    </thead>
                </table>

            </div>
        </div>

        <div className="table-responsive patient-responsive clients-table profile-toggler p-t-40">
            <div className="wrapper">
                <div className="wrapper-cell loading-data">
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>
                    <div className="text">
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                        <div className="text-line"></div>
                    </div>

                </div>

            </div>
        </div>

    </div>
</div>
    );
  }
}

export default ClientSplash;
