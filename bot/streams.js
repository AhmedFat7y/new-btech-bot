"use strict";
const StateHello = require('./states/state-hello');
const StateListCategories = require('./states/state-list-categories');
const StateInstallationRequest = require('./states/state-installation-request');
const StateInputNationalId = require('./states/state-input-national-id');
const StateInputPhone = require('./states/state-input-phone');
const StateInputSMSVerify = require('./states/state-input-sms-verify');
const StateLoadUserData = require('./states/state-load-user-data');
const StateDecideNextStep = require('./states/state-decide-next-step');
const StateSaveMessage = require('./states/state-save-message');
const StateLoadConvoState = require('./states/state-load-convo-state');
const StateSaveConvoState = require('./states/state-save-convo-state');
const StateAskAboutLimits = require('./states/state-ask-about-limits');
const StateAskAboutLimitsEnd = require('./states/state-ask-about-limits-end');
const StateAskAboutAddressLocation = require('./states/state-ask-about-address-location');
const StateFindNearestStore = require('./states/state-find-nearest-store');
const StateInputName = require('./states/state-input-name');
const StateMaintenanceRequest = require('./states/state-maintenance-request');
const StateInputAddress = require('./states/state-input-address');
const StateMaintenanceRequestEnd = require('./states/state-maintenance-request-end');
const StateInstallationRequestEnd = require('./states/state-installation-request-end');
const StateChangeLanguage = require('./states/state-change-language');
const NewStateShowProductsList = require('./states/new-state-show-products-list');
const StatePickCategoryBrand = require('./states/state-pick-category-brand');
const StateAskAboutPayment = require('./states/state-ask-about-payment');
const StateInputCashPayment = require('./states/state-Input-cash-payment');
const StateAskAboutDownPayment = require('./states/state-ask-about-down-payment');
const StateInputDownPayment = require('./states/state-input-down-payment');
const StateInputInstallment = require('./states/state-input-installment');
const StateAskAboutCategoryFilters = require('./states/state-ask-about-category-filters');
const StatePickInputFeatureValue = require('./states/state-input-main-feature-value');
const StateListDailyDeals = require('./states/state-list-daily-deals');
const StatePickSupportCategory = require('./states/state-pick-supported-category');
const StatePickSupportedBrand = require('./states/state-pick-supported-brand');
const StatePickNotSupportedBrand = require('./states/state-pick-not-supported-brand');
const StateHandleNotSupportedBrand = require('./states/state-handle-not-supported-brand');
const StateListProductPrices = require('./states/state-list-product-prices');
const StateAskAboutUserBirthday = require('./states/state-ask-about-user-birthday');
const StateAskAboutUserEmail = require('./states/state-ask-about-user-email');
const StateWelcomeEnd = require('./states/state-welcome-end');
const StateConfusionHandle = require('./states/state-handle-user-confusion')
const StateVerifyInputPhone = require('./states/state-verify-input-phone');
const StateReportIssue = require('./states/state-report-issue');
const StateConfirmIssue = require('./states/state-confirm-issue');  
const StateSaveIssue = require('./states/state-save-issue'); 
const StateBibo = require('./states/state-bibo');


let streams = {
  initialize: [StateLoadUserData, [StateSaveMessage, StateLoadConvoState], StateDecideNextStep],
  finalize: [StateSaveConvoState],
  // hi: [StateInputName, StateAskAboutUserBirthday, StateAskAboutUserEmail, StateWelcomeEnd, StateHello],
  hi: [StateHello],
  bibo: [StateBibo],
  showNextPage: [NewStateShowProductsList],
  dailyDeals: [StateListDailyDeals],
  shopping: [StateListCategories],
  categoryFilters: [StateAskAboutCategoryFilters],
  categorySearchBrands: [StatePickCategoryBrand, 'showNextPage'],
  categorySearchPricing: [StateAskAboutPayment],
  categorySearchOffers: ['showNextPage'],
  categorySearchMainFeature: [StatePickInputFeatureValue, 'showNextPage'],
  paymentCash: [StateInputCashPayment, 'showNextPage'],
  paymentMiniCash: [StateInputInstallment, 'showNextPage'],
  // paymentMiniCash: [StateAskAboutDownPayment],
  // paymentMiniCashDownPayment: [StateInputDownPayment, 'paymentMiniCashNoDownPayment'],
  // paymentMiniCashNoDownPayment: [StateInputInstallment, 'showNextPage'],
  showPrices: [StateListProductPrices],
  // installation: [StatePickSupportCategory, StatePickSupportedBrand, 'collectUserInfo', StateInstallationRequestEnd],
  maintenanceInstallation: [StatePickSupportCategory, StatePickSupportedBrand, 'collectUserInfo', StateMaintenanceRequestEnd],
  maintenanceNotSupportedBrand: [StatePickNotSupportedBrand, StateHandleNotSupportedBrand],
  askAboutLimits: [StateAskAboutLimits, StateInputNationalId, StateInputSMSVerify, StateAskAboutLimitsEnd],
  storeLocator: [StateAskAboutAddressLocation, StateFindNearestStore],
  collectUserInfo: [StateInputName, StateInputPhone, StateVerifyInputPhone],
  changeLanguage: [StateChangeLanguage],
  handleUserConfusion: [StateConfusionHandle],
  reportIssue: [StateReportIssue, StateConfirmIssue, StateSaveIssue],
  miniCash: []
};

for (let streamName in streams) {
  let stream = streams[streamName];
  assembleStream(stream);
}

function assembleStream(stream) {
  stream.forEach((StateClass, index) => {
    if (StateClass.constructor.name === 'String') {
      stream.splice(index, 1, ...streams[StateClass]);
      assembleStream(stream);
    }
  });
}

module.exports = streams;
