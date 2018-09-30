"use strict";
const StateBase = require('./state-base');
const btechApis = require('../apis-wrappers/btech-wrapper');
const async = require('async');

class StateInputNationalId extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
    this.needsInputVerification = true;
    this.regex = /^\d{14}$/g;
    this.isValidNationalId=true;
    this.isUserExisted=true;
  }

  constructReply() {
    const self = this;
    return {
      text: self.localesManager.questions.enterNationalId,
    };
  }

  constructFailurePrompt() {
    const self = this;
    if (!this.isValidNationalId) {
      return {
        text: self.localesManager.validations.enterValidNationalId
      };
    }
    if (!this.isUserExisted) {
      return {
        text: self.localesManager.validations.enterValidBtechUserNumber
      };
    }

  }

  constructSuccessPrompt() {
    return {
      text: "This is valid National ID!"
    };
  }

  execute(callback) {
    console.log('Executing State input national Id');
    this.managePrompts(this.constructReply(), (callback));
  }

  failurePrompt(callback) {
    callback(null, false, this.constructFailurePrompt());
  }

  successPrompt(callback) {
    callback(null, true, this.constructSuccessPrompt());
  }

//parseArabic function used to convert an input of Arabic numbers to English number
   parseArabic(str) {
    return str.replace(/[٠١٢٣٤٥٦٧٨٩]/g, function (d) {return d.charCodeAt(0) - 1632;})
  }

  verifyInput(callback) {
    console.log('Verifying Inputs in state input national Id');
    let {incomingMessage, user} = this.stateManager.data;
    let nationalId = incomingMessage.text.trim().replace(/\s/g, '');
    // this if condition checks if the phone number is in the range of arabic numbers
    nationalId = this.parseArabic(nationalId);
    let isSuccess = this.regex.test(nationalId);
    // I need to verify the national Id validation
    this.isValidNationalId = isSuccess;
    if (isSuccess) {
      // I need to verify it's an existing national Id
      this.checkIfUserExists(nationalId, user, callback);

    } else {
      callback(null, isSuccess);
    }
  }

  checkIfUserExists(nationalId, user, callback) {
    let isSuccess = true;
    async.waterfall([
      nextFunc => btechApis.getCustomerDetails(nationalId, nextFunc),
    ], (err, customerDtails) => {
      if (err) {
        console.error('error fetching user data', err);
        isSuccess = false;
      } else {
        user.collectedData.nationalId = nationalId;
        if (nationalId === '11111111111111') {
          user.collectedData.phone = '201208208208';
        } else {
          user.collectedData.phone = customerDtails.MobilePhone;
        }

      }
      this.isUserExisted = isSuccess;
      callback(null, isSuccess);
    });
  }


}
module.exports = StateInputNationalId;
