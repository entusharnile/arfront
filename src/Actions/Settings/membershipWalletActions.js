import axios from 'axios';
import config from '../../config';
import { getToken, setConfigData, handleInvalidToken, positionFooterCorrectly, setToken } from '../../Utils/services.js';
import { id } from 'postcss-selector-parser';
let url = config.API_URL;
const membershipWalletInstance = axios.create();
membershipWalletInstance.defaults.headers.common['access-token'] = getToken();

let source = axios.CancelToken.source()

positionFooterCorrectly();
membershipWalletInstance.interceptors.response.use(function (response) {
    // update access-token if logged-user update user-data (in case of self) - START
    if (response.headers.access_token) {
        if (getToken() !== response.headers.access_token) {
            setToken(response.headers.access_token);
        }
    }
    // update access-token if logged-user update user-data (in case of self) - END
    if (response.data != undefined && response.data.global_settings != undefined) {
        setConfigData(response.data.global_settings);
    }
    positionFooterCorrectly();
    return response;
}, function (error) {
    if (!error.response) {
        return { data: { data: "", message: "server_error", status: 500 } }
    } else {
        if (error.response.status == 500) {
            return { data: { data: "", message: "server_error", status: 500 } }
        }
        let msg = error.response.data.message;
        if (msg == 'invalid_token' || msg == 'session_timeout' || msg == 'server_error' || msg == 'token_not_found') {
            handleInvalidToken();
        }
        return Promise.reject(error);
    }
});

export function emptyMembershipWallet(formData) {
    return dispatch => {
        dispatch({ "type": "MEMBRTSHIP_WALLET_EMPTY_DATA" });
    }
}


export function getMembershipWallet() {
    return dispatch => {
        membershipWalletInstance.get(url + "account/wallet-membership-setting").then(response => {
            dispatch({ "type": "GET_MEMBERSHIP_WALLET_DATA", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_MEMBERSHIP_WALLET_DATA", "payload": error.response.data });
        })
    }
}
export function updateMembershipWallet(formData) {
    return dispatch => {
        membershipWalletInstance.put(url + "account/wallet-membership-setting", (formData)).then(response => {
            dispatch({ "type": "UPDATE_MEMBERSHIP_WALLET_DATA", "payload": response.data })
        }).catch(error => {
            dispatch({ "type": "UPDATE_MEMBERSHIP_WALLET_DATA", "payload": error.response.data })
        })
    }
}
export function updateWallet(formData) {
    return dispatch => {
        membershipWalletInstance.put(url + "settings-wallet", (formData)).then(response => {
            dispatch({ "type": "UPDATE_SETTING_WALLET_DATA", "payload": response.data })
        }).catch(error => {
            dispatch({ "type": "UPDATE_SETTING_WALLET_DATA", "payload": error.response.data })
        })
    }
}
export function updateMembership(formData) {
    return dispatch => {
        membershipWalletInstance.put(url + "settings-membership", (formData)).then(response => {
            dispatch({ "type": "UPDATE_SETTING_MEMBERSHIP_DATA", "payload": response.data })
        }).catch(error => {
            dispatch({ "type": "UPDATE_SETTING_MEMBERSHIP_DATA", "payload": error.response.data })
        })
    }
}

const serialize = function(obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

export const searchProductByName = (formData) => {
  return dispatch => {
      if (typeof source != typeof undefined) {
        source.cancel('Operation canceled due to new request.')
      }
      source = axios.CancelToken.source();
      axios.get(url + "discount-packages/search-product?"+serialize(formData.params), { cancelToken: source.token }).then(response => {
        dispatch({ "type": 'MEMBERSHIP_PRODUCT_SEARCH_LIST', "payload": response.data });
      }).catch(error => {
          if (axios.isCancel(error)) {
          } else {
              dispatch({ "type": 'action', "payload": error.response.data });
          }
      });
  }
}

export function getMembershipMultiTier(membershipTierId) {
    return dispatch => {
        membershipWalletInstance.get(url + "save-multitier-program/"+membershipTierId).then(response => {
            dispatch({ "type": "GET_MEMBERSHIP_MULTI_TIER", "payload": response.data })
        }).catch(error => {
            dispatch({ "type": "GET_MEMBERSHIP_MULTI_TIER", "payload": error.response.data })
        })
    }
}

export function saveMembershipMultiTier(membershipTierId,formData) {
    return dispatch => {
        membershipWalletInstance.post(url + "save-multitier-program/"+membershipTierId, (formData)).then(response => {
            dispatch({ "type": "SAVE_MEMBERSHIP_MULTI_TIER", "payload": response.data })
        }).catch(error => {
            dispatch({ "type": "SAVE_MEMBERSHIP_MULTI_TIER", "payload": error.response.data })
        })
    }
}

export function changeMembershipMultiTierStatus(membershipTierId,formData) {
    return dispatch => {
        membershipWalletInstance.put(url + "save-multitier-program/"+membershipTierId, (formData)).then(response => {
            dispatch({ "type": "CHANGE_MEMBERSHIP_MULTI_TIER_STATUS", "payload": response.data })
        }).catch(error => {
            dispatch({ "type": "CHANGE_MEMBERSHIP_MULTI_TIER_STATUS", "payload": error.response.data })
        })
    }
}

export function deleteMembershipMultiTier(membershipTierId) {
    return dispatch => {
        membershipWalletInstance.delete(url + "save-multitier-program/"+membershipTierId).then(response => {
            dispatch({ "type": "DELETE_MEMBERSHIP_MULTI_TIER", "payload": response.data })
        }).catch(error => {
            dispatch({ "type": "DELETE_MEMBERSHIP_MULTI_TIER", "payload": error.response.data })
        })
    }
}
