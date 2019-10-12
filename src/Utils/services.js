import axios from 'axios';
import config from '../config';
import moment from 'moment';
import validator from 'validator';

let url = config.API_URL;
export function isLoggedIn() {
  return localStorage.getItem('isLoggedIn');
}

export function getUser() {
  return localStorage.getItem('userData');
}

export function setToken(access_token) {
  localStorage.setItem('access_token', access_token);
  axios.defaults.headers.common['access-token'] = getToken();
  return true;
}

export function getToken(access_token) {
  let token = localStorage.getItem('access_token')
  if(token) {

  	return token;
  } else
  		return false;

}

export function logout() {
  const logoutInstance = axios.create();
  logoutInstance.defaults.headers.common['access-token'] = getToken();
  logoutInstance.get(url + "user/logout").then(response => {
      clearToken();
      clearUserData();
      window.location.href = "/login";
      return
  }).catch(error => {
      clearToken();
      clearUserData();
      window.location.href = "/login";
  });
}

export function clearToken() {
  localStorage.removeItem('access_token');
  return
}
export function handleInvalidToken() {
  clearToken();
  clearUserData();
  window.location.href = "/login";
}
export function clearUserData() {
  localStorage.removeItem('userData');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('globalPrivileges');
  localStorage.removeItem('tempLoggedUserData')
  localStorage.removeItem('calendarFilter')
  localStorage.removeItem('selectionRange')
  localStorage.removeItem('selectionRange-invoices')
  localStorage.removeItem('selectionRange-report')
  //localStorage.removeItem('languageData');
  let languageData = JSON.parse(localStorage.getItem('languageData'))
  for(let x in languageData) {
    if(x != 'guest' && x != 'global')   {
      delete languageData[x];
    }
  }
/*  if(languageData !== null && languageData['dashboard'] !== null && languageData['dashboard'] !== undefined)
    delete languageData['dashboard']

  if(languageData !== null && languageData['settings'] !== null && languageData['settings'] !== undefined)
    delete languageData['settings']
*/
  /*if(languageData['settings'])
    delete languageData['settings']

  if(languageData['settings'])
    delete languageData['settings']*/

  localStorage.setItem('languageData', JSON.stringify(languageData))
  localStorage.removeItem('countVal');
  localStorage.removeItem('showLoader');
  localStorage.removeItem('sortOnly');
  localStorage.removeItem('currentUserRole');
  localStorage.removeItem('loadFresh');
  localStorage.removeItem('login_attempts');

  // remove global-config-data
  localStorage.removeItem('defTimeLine');
  localStorage.removeItem('timeFormat');
  localStorage.removeItem('dateFormat');
  localStorage.removeItem('stripeConnection');
  localStorage.removeItem('isPosEnabled');
  localStorage.removeItem('currencySymbol');
  localStorage.removeItem('currencyLabel');
  localStorage.removeItem('isMembershipEnabled');
  localStorage.removeItem('membershipTier');

  localStorage.removeItem('redirectTo');
  localStorage.removeItem('flashToast');
  localStorage.removeItem('cSortBy');
  localStorage.removeItem('cSortOrder');
  localStorage.removeItem('cLetterKey');
  localStorage.removeItem('cTerm');
  localStorage.removeItem('cFilterID');
  localStorage.removeItem('cFilterName');
  localStorage.removeItem('RecentlySelectionRange');
  localStorage.removeItem('UserLogSelectionRange');
  localStorage.removeItem('recentlyViewedData');
  localStorage.removeItem('recentlyViewedData');
  localStorage.removeItem('selectId');
  localStorage.removeItem('AppointmentReportRange');

  // remove active-products filter (iapf = inventory active product filter)
  localStorage.removeItem('iapfCategory')
  localStorage.removeItem('iapfStock')
  localStorage.removeItem('iapfTerm')
  localStorage.removeItem('iapfSortBy');
  localStorage.removeItem('iapfSortOrder');

  // remove inactive-products filter (iiapf = inventory in-active product filter)
  localStorage.removeItem('iiapfCategory')
  localStorage.removeItem('iiapfStock')
  localStorage.removeItem('iiapfTerm')
  localStorage.removeItem('iiapfSortBy')
  localStorage.removeItem('iiapfSortOrder')

  // remove discount-packages filter (idpf = inventory discount package filter)
  localStorage.removeItem('idpfSortBy');
  localStorage.removeItem('idpfSortOrder');
  localStorage.removeItem('idpfStatus');
  localStorage.removeItem('idpfType');
  localStorage.removeItem('idpfTerm');

  // remove recenlty-deleted filter (rdf = recently deleted filter)
  localStorage.removeItem('rdfDateRange');

  localStorage.removeItem('localInvoicesArray');
  localStorage.removeItem('localSelectedEmployeeIdList');
  localStorage.removeItem('localSelectedLocationIdList');
  // remove default country code
  localStorage.removeItem('cCode');
  localStorage.removeItem('objName');
  return
}

export function checkIfPermissionAllowed(givenPrivilege) {
  let userData      = JSON.parse(localStorage.getItem('userData'))
  let allPermission = []
  if ( userData && givenPrivilege ) {
    allPermission = userData.permissions

    if ( allPermission ) {
      if ( allPermission.indexOf(givenPrivilege) > -1 ) {
        return true
      }
    }
  }
  return false
}

/*
  style = 'currency', 'decimal' or 'percent'
*/
export function numberFormat(amount, style, minimumFractionDigits) {
  let locale                = 'en'; // todo
  let currency              = getCurrencyLabel(); //'usd'; // todo
  style                     = style || 'decimal';
  let maximumFractionDigits = 2;

  var options               = {style: style, currency: currency, maximumFractionDigits: maximumFractionDigits, minimumFractionDigits: minimumFractionDigits};
  var formatter             = new Intl.NumberFormat(locale, options);

  if ( amount && amount !== null && amount !== '' && amount > 0 ) {
    return formatter.format(amount);
    //return givenNumber.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
  }

  return formatter.format(0);
}

/*
time12h = '02:55 AM', '05:30:00 am'
*/
export function convertTime12to24(time12h, isSeconds=false) {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }

  if (modifier.toLowerCase() === 'pm') {
    hours = parseInt(hours, 10) + 12;
  }
  if(isSeconds) {
    return hours + ':' + minutes + ':00';
  } else {
    return hours + ':' + minutes;
  }
}

/*
time = '14:45:55', '19:50'
*/
export function convertTime24to12 (time) {
  time = time.toString().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
  if (time.length > 1) {
    time = time.slice (1);
    time[0] = +time[0] % 12 || 12;
    if(time[0] < 10) {
      time[0] = '0'+time[0]
    }
  }
  delete time[time.length-1];
  return time.join ('');
}

/*
time = '14:45:55', '19:50'
*/
export function getAmPm (time) {
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
  if (time.length > 1) {
    time = time.slice (1);
    return +time[0] < 12 ? 'AM' : 'PM';
  }
  return null;
}

/*
convert test to Test
*/
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function displayName(obj) {
  let returningName = '';

  if ( obj && obj.firstname ) {
    returningName += capitalizeFirstLetter(obj.firstname)
  }

  if ( returningName !== '' ) {
    returningName += ' '
  }

  if ( obj && obj.lastname ) {
    returningName += capitalizeFirstLetter(obj.lastname)
  }

  return returningName
}

export function setCurrencyLabel(currencyLabel) {
  currencyLabel = currencyLabel || 'usd';
  localStorage.setItem('currencyLabel', currencyLabel);
  return true;
}

export function getCurrencyLabel() {
  let currencyLabel = localStorage.getItem('currencyLabel')
  if(currencyLabel) {
  	return currencyLabel;
  } else
  		return 'usd';
}


export function formatBytes(a,b){
  if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]
}

// date should be string
export function showFormattedDate(date, showTime, specifiedFormat) {
  showTime          = showTime || false;
  specifiedFormat   = specifiedFormat || ''
  const dateFormat  = getDateFormat(); // todo : get it from localstorage
  const timeFormat  = getTimeFormat(); // todo : get it from localstorage

  let userFormat    = getDateFormat(); // do not change this
  let returnFormat  = getDateFormat();
  let defDate       = '';

  if ( date === "0000-00-00 00:00:00" || date === "0000-00-00" || date === "0000/00/00 00:00:00" || date === "0000/00/00" ) {
		return "";
	}

  if ( date === '' || date === undefined || date === null ) {
    if ( specifiedFormat != '' ) {
      returnFormat = specifiedFormat;
    }
    defDate = moment(moment(), userFormat).format(returnFormat);
    defDate = defDate.split(' ')[0];
    date    = defDate;
    return date
  }

  if ( date && dateFormat && timeFormat ) {
    if ( showTime ) {
      userFormat    = dateFormat + ' ' + timeFormat;
      returnFormat  = userFormat;
    } else {
      userFormat    = dateFormat;
      returnFormat  = dateFormat;
    }

    if ( specifiedFormat != '' ) {
      returnFormat = specifiedFormat;
    }

    if (date.indexOf('/') > -1 || date.indexOf('-') > -1 ) {

      // Additional code - START
      let dateTimeArray = date.split(' ');
      let dateArray     = dateTimeArray[0]
      if (dateArray.indexOf('/')  !== -1) {
        dateArray = dateArray.split('/');
      } else {
        dateArray = dateArray.split('-');
      }

        // if((typeof dateArray === 'object' || typeof dateArray === 'array') && dateArray.length === 3){
        //   let isDateUpdated = false
        //   if(dateArray[0].length === 2 && dateArray[0] > 12){
        //     if (dateFormat == 'YYYY/MM/DD' || dateFormat === 'MM/DD/YYYY') {
        //       return moment(date, 'DD-MM-YYYY').format(returnFormat);
        //     }
        //   } else if(dateArray[1].length === 2 && dateArray[1] > 12){
        //     if (dateFormat == 'DD/MM/YYYY') {
        //       return moment(date, 'MM-DD-YYYY').format(returnFormat);
        //     }
        //   } else if(dateArray[2].length === 2 && dateArray[2] > 12){
        //     if (dateFormat == 'DD/MM/YYYY') {
        //       return moment(date, 'YYYY/MM/DD').format(returnFormat);
        //     }
        //   }
        // }
      // Additional code - END

      if ( dateFormat == 'DD/MM/YYYY' ) {
        return moment(date).format(returnFormat);
      }
      return moment(date).format(returnFormat);
    } else {
      return moment.unix(date).format(returnFormat);
    }
  }
}

// send format like YYYY/MM/DD or DD/MM/YYYY
export function showCustomFormattedDate(date, format, showTime) {
  showTime = showTime || false;

  let timeFormat = "hh:mm A"; // todo : get it from localstorage

  if ( date == "0000-00-00 00:00:00" || date == "0000-00-00" ) {
		return "";
	}

  if ( date && format && timeFormat ) {
    if ( showTime ) {
      format = format + ' ' + timeFormat;
    } else {
      format = format;
    }

    if ( date.indexOf('/') > -1 || date.indexOf('-') > -1 ) {
      return moment(date).format(format);
    } else {
      return moment.unix(date).format(format);
    }
  }
}

// date format e.g March 01, 2020
export function showMonthFormattedDate(date, showTime) {
  showTime = showTime || false;

  let format     = "MMMM DD, YYYY"; // do not change this
  let dateFormat = "YYYY/MM/DD"; // todo : get it from localstorage
  let timeFormat = "hh:mm A"; // todo : get it from localstorage

  if ( date == "0000-00-00 00:00:00" || date == "0000-00-00" ) {
		return "";
	}

  if ( date && dateFormat && timeFormat ) {
    if ( showTime ) {
      //format = dateFormat + ' ' + timeFormat;
      return moment(date).format(format)+ ' ' + timeFormat;
    } else {
      return moment(date).format(format);
//      format = dateFormat;
    }

    if ( date.indexOf('/') > -1 || date.indexOf('-') > -1 ) {
      return moment(date).format(format);
    } else {
      return moment.unix(date).format(format);
    }
  }
}

export function isNumber(n) {
  if ( Math.sign(n) === -1 ) {
    return false
  }
  return !isNaN(parseFloat(n)) && isFinite(n)
}

export function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

export function setConfigData(confgData){
  if(confgData.pos_data !== undefined){
    if(confgData.pos_data.is_pos_enabled !== undefined  && confgData.pos_data.is_pos_enabled !== null && confgData.pos_data.is_pos_enabled >= 0){
      setIsPosEnabled(confgData.pos_data.is_pos_enabled);
    }
    if(confgData.pos_data.stripe_connection !== undefined  && confgData.pos_data.stripe_connection !== null && confgData.pos_data.stripe_connection !== ''){
      setStripeConnection(confgData.pos_data.stripe_connection);
    }
    if(confgData.pos_data.currency_symbol !== undefined  && confgData.pos_data.currency_symbol !== null && confgData.pos_data.currency_symbol !== ''){
      setCurrencySymbol(confgData.pos_data.currency_symbol);
    }
    if(confgData.pos_data.currency_code !== undefined  && confgData.pos_data.currency_code !== null && confgData.pos_data.currency_code !== ''){
      setCurrencyLabel(confgData.pos_data.currency_code);
    }
  }

  if(confgData.account_preference !== undefined){
    if(confgData.account_preference.is_membership_enable !== undefined  && confgData.account_preference.is_membership_enable !== null && confgData.account_preference.is_membership_enable >= 0){
      setIsMembershipEnabled(confgData.account_preference.is_membership_enable);
    }
    if(confgData.account_preference.membership_tier !== undefined  && confgData.account_preference.membership_tier !== null && confgData.account_preference.membership_tier !== ''){
      setMembershipTier(confgData.account_preference.membership_tier);
    }
  }

  if(confgData.time_format !== undefined && confgData.time_format !== '' && confgData.time_format !== null){
    setTimeFormat(confgData.time_format);
  }
  if(confgData.date_format !== undefined && confgData.date_format !== '' && confgData.date_format !== null){
    setDateFormat(confgData.date_format);
  }
}

export function setIsMembershipEnabled(isMembershipEnabled) {
  isMembershipEnabled = isMembershipEnabled || false;
  localStorage.setItem('isMembershipEnabled', isMembershipEnabled);
  return true;
}
export function getIsMembershipEnabled() {
  let isMembershipEnabled = localStorage.getItem('isMembershipEnabled')
  if(typeof isMembershipEnabled !== 'undefined' && typeof isMembershipEnabled !== undefined) {
    if(isMembershipEnabled == '1'){
      return true;
    }
  }
  return false;
}

export function setMembershipTier(membershipTier) {
  membershipTier = membershipTier || 'single';
  localStorage.setItem('membershipTier', membershipTier);
  return true;
}
export function getMembershipTier() {
  let membershipTier = localStorage.getItem('membershipTier')
  if(membershipTier) {
  	return membershipTier;
  } else
  		return 'single';
}

export function setCurrencySymbol(currencySymbol) {
  currencySymbol = currencySymbol || '$';
  localStorage.setItem('currencySymbol', currencySymbol);
  return true;
}
export function getCurrencySymbol() {
  let currencySymbol = localStorage.getItem('currencySymbol')
  if(currencySymbol) {
  	return currencySymbol;
  } else
  		return '$';
}

export function setStripeConnection(stripeConnection) {
  stripeConnection = stripeConnection || '';
  localStorage.setItem('stripeConnection', stripeConnection);
  return true;
}
export function getStripeConnection() {
  let stripeConnection = localStorage.getItem('stripeConnection')
  if(stripeConnection) {
  	return stripeConnection;
  } else
  		return false;
}

export function setIsPosEnabled(isPosEnabled) {
  isPosEnabled = isPosEnabled || false;
  localStorage.setItem('isPosEnabled', isPosEnabled);
  return true;
}
export function getIsPosEnabled() {
  let isPosEnabled = localStorage.getItem('isPosEnabled')
  if(typeof isPosEnabled !== 'undefined' && typeof isPosEnabled !== undefined) {
    if((typeof isPosEnabled === 'string' && isPosEnabled === 'true') || typeof isPosEnabled === 'boolean' && isPosEnabled === true){
      return true;
    }
  }
  return false;
}

export function setTimeFormat(timeFormat) {
  switch (timeFormat) {
    case 'h:i a':
      timeFormat = 'hh:mm A';
      break;
    case 'H:i':
      timeFormat = 'HH:mm';
      break;
    default:
      timeFormat = 'hh:mm A';
      break;
  }
  localStorage.setItem('timeFormat', timeFormat);
  return true;
}

export function formatTime(time) {
  let timeFormat = getTimeFormat();
  return moment(time, "HH:mm:ss").format(timeFormat);
}

export function getTimeFormat() {
  let timeFormat = localStorage.getItem('timeFormat')
  if(timeFormat) {
  	return timeFormat;
  } else
  		return 'hh:mm A';
}

export function setDateFormat(dateFormat) {
  switch (dateFormat) {
    case 'Y/m/d':
      dateFormat = 'YYYY/MM/DD';
      break;
    case 'd/m/Y':
      dateFormat = 'DD/MM/YYYY';
      break;
    case 'm/d/Y':
      dateFormat = 'MM/DD/YYYY';
      break;
    default:
      dateFormat = "YYYY/MM/DD";
      break;
  }
  localStorage.setItem('dateFormat', dateFormat);
  return true;
}

export function getDateFormat() {
  let dateFormat = localStorage.getItem('dateFormat')
  if(dateFormat) {
  	return dateFormat;
  } else
  		return "YYYY/MM/DD";
}
export function convertMinsToHrsMins(mins) {
  let h = Math.floor(mins / 60);
  let m = mins % 60;
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  return `${h}:${m}`;
}

export function handleScheduleMasking(value,selection,cursorPosition,userInput){
  if (value.endsWith(':') && userInput !== ':') {
    if (cursorPosition === value.length) {
      cursorPosition--;
      selection = { start: cursorPosition, end: cursorPosition };
    }
    value = value.slice(0, -1);
  }
  if(cursorPosition == 2) {
    if(value > 12) {
      value = 12;
    }
  }
  var tmpArr = value.split(':');
  if(parseInt(tmpArr[0]) > 12) {
    if(cursorPosition == 1){
      tmpArr[0] = '0'+tmpArr[0].substring(0, 1)
    } else {
      tmpArr[0] = '0'+ +tmpArr[0].substring(1)
    }
    selection = { start: 3, end: 3 };
  }

  if(parseInt(tmpArr[0]) <= 0) {
    tmpArr[0] = '00';
  }

  if (parseInt(tmpArr[1]) >= 60) {
    if(cursorPosition == 4){
      tmpArr[1] = '0'+tmpArr[1].substring(0, 1)
      selection = { start: 5, end: 5 };
    }
  }


  if(tmpArr[0] == undefined || tmpArr[0] == null) {
    tmpArr[0] = '12';
  }
  if(tmpArr[1] == undefined || tmpArr[1] == null) {
    tmpArr[1] = '00';
  }
  if(value.length < 5){
    value = value.padEnd(5,'0')
  }

  tmpArr[0] = tmpArr[0].toString();
  tmpArr[0] = tmpArr[0].padEnd(2, '0');
  tmpArr[1] = tmpArr[1].toString();
  tmpArr[1] = tmpArr[1].padEnd(2, '0');
  value = tmpArr.join(':');
  return {
    value,
    selection
  };
}

export function setRedirectTo(redirectTo) {
  localStorage.setItem('redirectTo', redirectTo);
  return true;
}
export function getRedirectTo() {
  let redirectTo = localStorage.getItem('redirectTo')
  if(redirectTo) {
  	return '/'+redirectTo;
  } else
  		return null;
}
export function getRedirectUrl(redirectTo) {
  let isValuePassed = false;
  if(redirectTo){
    isValuePassed = true;
  }
  redirectTo = redirectTo || getRedirectTo();
  let redirectUrl = '';
  if(redirectTo) {
    switch (redirectTo) {
      case 'dashboard_index':
        redirectUrl = '/dashboard';
        break;
      case 'patients_manage':
        redirectUrl = '/clients';
        break;
      case 'settings_profile':
        redirectUrl = '/settings/profile';
        break;
      case 'settings_subscriptions':
        redirectUrl = '/settings/manage-subscription';
        break;
      case 'subscriptions_upgrade_datastorage':
        redirectUrl = '/settings/manage-subscription';
        break;
      case 'subscriptions_upgrade_plan':
        redirectUrl = '/upgrade-subscription-plan';
        break;
      case 'subscriptions_upgrade_account_to_stripe':
        redirectUrl = '/upgrade-account-to-stripe';
        break;
      case 'bba_signed':
        redirectUrl = '/accept-agreement';
        break;
      default:
        if(isValuePassed){
          redirectUrl = getRedirectUrl();
        } else {
          redirectUrl = '';
        }
        break;
    }
  }
  return redirectUrl;
}
export function setFlashToast(flashToast) {
  localStorage.setItem('flashToast', flashToast);
  return true;
}

export function getFlashToast() {
  let flashToast = localStorage.getItem('flashToast')
  localStorage.removeItem('flashToast')
  if(flashToast) {
  	return flashToast;
  } else
  		return null;
}

export function toggleBodyScroll(isScroll){
  if(isScroll !== undefined && isScroll === true){
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

}

export function positionFooterCorrectly(isScroll){
  let footer = document.getElementById('protected-footer-fixed');
  if(footer != null && footer != undefined){

    setTimeout(function(){
      let rootHeight = document.getElementById('root').clientHeight;
      let scrollHeight = document.getElementById('root').scrollHeight;
      let clHeight = ''
      if(document.getElementById('protected-footer-fixed')) {
        clHeight = document.getElementById('protected-footer-fixed').clientHeight
        let footerHeight = clHeight;
        if((rootHeight + footerHeight) > window.innerHeight){
          footer.classList.remove('footer-fixed')
        } else {
          footer.classList.add('footer-fixed')
          if ( (window.location.pathname) && (window.location.pathname.startsWith('/clients/after-photos') ||  window.location.pathname.startsWith('/clients/treatment-markings') ) ) {
            if ( scrollHeight < 800 ) {
              footer.classList.add('footer-fixed');
            } else {
              footer.classList.remove('footer-fixed');
            }
          }
        }
      }
    }, 700);
  }
}

export function isFormSubmit(interval){
  interval = interval || 1
  let isFormSubmit = true;
  let onSubmitTime = localStorage.getItem('onSubmitTime')
  if(onSubmitTime) {
    let currentTime = moment()
    if ((currentTime.diff(moment.unix(onSubmitTime), 'seconds')) <= interval) {
      isFormSubmit = false
    } else {
      localStorage.setItem('onSubmitTime',moment().format('X'))
    }
  } else {
    localStorage.setItem('onSubmitTime',moment().format('X'))
  }
  return isFormSubmit;
}

export function isPositiveNumber(value, minimumNumber, maximumNumber){
  minimumNumber = minimumNumber || 0
  maximumNumber = maximumNumber || 9999999999
  value = String(value);
  let isValid = false;
  const regex = /^[+]?([.]\d+|\d+[.]?\d*)$/
  if (regex.test(value)) {
    let decimalDigit = '0';
    if (value.indexOf(".") > -1) {
      decimalDigit = value.split('.').pop()
    }
    if (validator.isFloat(value, { min: minimumNumber, max: maximumNumber }) && decimalDigit.length < 3) {
      isValid = true;
    }
  }
  return isValid
}

export function isInteger(value, minimumNumber, maximumNumber){
  minimumNumber = minimumNumber || 0
  maximumNumber = maximumNumber || 9999999999
  value = String(value);
  let isValid = false;
  const regex = /^[+]?([.]\d+|\d+[.]?\d*)$/
  if (regex.test(value)) {
    if (validator.isInt(value, { min: minimumNumber, max: maximumNumber, allow_leading_zeroes :true })) {
      isValid = true;
    }
  }
  return isValid
}

export function dateFormatPicker(){
  let format = 'yyyy-MM-dd';
  if(getDateFormat()){
    switch (getDateFormat()) {
      case 'YYYY/MM/DD':
        format = 'yyyy-MM-dd';
        break;
      case 'DD/MM/YYYY':
        format = 'dd/MM/yyyy';
        break;
      case 'MM/DD/YYYY':
        format = 'MM/dd/yyyy';
        break;
      default:
        format = 'yyyy-MM-dd';
        break;
    }
  }return format;
}

export function getIsDashboardEnabled() {
  let userData = (JSON.parse(localStorage.getItem('userData'))) ? JSON.parse(localStorage.getItem('userData')) : null;
  if(userData && userData.user) {
    if(userData.user.is_dashboard_enabled === 'true' || userData.user.is_dashboard_enabled === true){
      return true;
    }
  }
  return false;
}

export function isInt(n){
    if ( Math.sign(n) === -1 ) {
      return false
    }
    n = parseFloat(n);
    return parseInt(n) === n;
}

export function autoScrolling(autoScrolling) {
  if(autoScrolling !== null && autoScrolling !== undefined){
    localStorage.setItem('autoScrolling', autoScrolling);
    return true;
  } else {
    autoScrolling = localStorage.getItem('autoScrolling')
    if(autoScrolling == true || autoScrolling == 'true') {
      //console.log('getAutoScrolling true');
    	return true;
    } else{
      //console.log('getAutoScrolling false');
    	return false;
    }
  }
}
