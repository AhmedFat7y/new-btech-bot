"use strict";
const StateBase = require('./state-base');
const {REQUEST_TYPE} = require('../../db/models/user');
const btechApis = require('../apis-wrappers/btech-wrapper');
const async = require('async');
const moment = require('moment');

class StateAskAboutLimits extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
  }
  
  constructCreditLimitReply(creditLimitData) {
    const self = this;
    let numberFormatter =  self.localesManager.numberFormatter
    return [
      {
        text: self.localesManager.phrases.yourCreditLimitIs + numberFormatter.format(creditLimitData.CreditLimit),
      },
      self.getImageServicesMessage(),
    ];
  }
  formatInstallments(installmentsList) {
    const self = this;
    let locale = self.localesManager.getLocale();
    let momentLocale = locale === 'ar'? 'ar-sa' : 'en-au';
    let numberFormatter =  self.localesManager.numberFormatter;
    return installmentsList
      .slice(0, Math.min(5, installmentsList.length))
      .map(installment => self.localesManager.buttons.installment 
      + ': ' + numberFormatter.format(parseInt(installment.Value))  + ' ' 
      + self.localesManager.buttons.toBePaidAt + ': '
      + moment(installment.PaymentDate, 'YYYY-MM-DD')
        .locale(momentLocale)
        .format('LL')
      )
      .join('\n')
  }
  construcInstallmentsReply({overDue, thisMonth, upcoming}) {
    const self = this;
    let overDueMessages = null,
    thisMonthMessages = null,
    upcomingMessages = null;
    
    if (overDue.length) {
      overDueMessages = [
        {
          text: self.localesManager.phrases.hereAreOverDueInstallments
        },
        {
          text: self.formatInstallments(overDue)
        }
      ];
    } else {
      overDueMessages = [
        {
          text: self.localesManager.phrases.youHaveNoOverDueInstallments
        }
      ];
    }

    if (thisMonth.length) {
      thisMonthMessages = [
        {
          text: self.localesManager.phrases.hereAreThisMonthInstallments
        },
        {
          text: self.formatInstallments(thisMonth)
        }
      ];
    } else {
      thisMonthMessages = [
        {
          text: self.localesManager.phrases.youHaveNoThisMonthInstallments
        }
      ]
    }
    
    if (upcoming.length) {
      upcomingMessages = [
        {
          text: self.localesManager.phrases.hereAreUpcomingInstallments
        },
        {
          text: self.formatInstallments(upcoming)
        }
      ];
    } else {
      upcomingMessages = [
        {
          text: self.localesManager.phrases.youHaveNoUpcomingInstallments
        }
      ]
    }
    return [...overDueMessages, ...thisMonthMessages, ...upcomingMessages, self.getServicesMessage()];
  }
  displayCreditLimit(nationalId, callback) {
    let self = this;
    async.waterfall([
      nextFunc => btechApis.getCreditLimit(nationalId, nextFunc),
      (creditLimitData, nextFunc) => self.managePrompts(self.constructCreditLimitReply(creditLimitData), nextFunc),
    ], err => self.displayError(err, callback));
  }

  displayInstallments(nationalId, callback) {
    let self = this;
    async.waterfall([
      nextFunc => btechApis.getInstallments(nationalId, nextFunc),
      (installmentsData, nextFunc) => self.managePrompts(self.construcInstallmentsReply(installmentsData), nextFunc)
    ], err => self.displayError(err, callback));
  }
  execute(callback) {
    console.log('Executing State askAboutLimits end');
    let {user} = this.stateManager.data;
    
    if (user.collectedData.requestType === REQUEST_TYPE.REMAINING_INSTALLMENTS) {
      this.displayInstallments(user.nationalId, callback);
    } else if (user.collectedData.requestType === REQUEST_TYPE.CREDIT_LIMIT) {
      this.displayCreditLimit(user.nationalId, callback);
    }
  }
  // if there's an error fetching the data, just tell the user there was an error, otherwise, continue normally
  displayError(err, callback) {
    const self = this;
    if (err) {
      console.error('Error Executing State askAboutLimits end', err);
      self.managePrompts([
        {
          text: self.localesManager.phrases.unavailableServiceTryAgainLater,
        }
      ]);
    }
    callback(null);
  }
}
module.exports = StateAskAboutLimits;
