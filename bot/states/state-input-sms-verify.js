"use strict";
const StateBase = require('./state-base');
const async = require('async');
const unifonicApis = require('../apis-wrappers/unifonic-wrapper');

class StateInputSmsVerification extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
    this.needsInputVerification = true;
    this.regex = /^\+?\d+$/g;
  }

  constructReply() {
    const self = this;
    return [
      {
        text: self.localesManager.questions.enterSmsCode,
      }
    ];
  }

  constructFailurePrompt() {
    const self = this;
    return {
      text: self.localesManager.validations.enterValidSmsCode
    };
  }

  constructSuccessPrompt() {
    return {
      text: "Ok, this is a valid code!"
    };
  }

  execute(callback) {
    console.log('Executing State input sms verify');
    let {user} = this.stateManager.data;
    let verificationCode = getRandomIntInclusive(100000, 999999);
    user.collectedData.sms.verificationCode =  verificationCode;

    async.series([
      seriesCallback => user.save(seriesCallback),
      seriesCallback => unifonicApis.sendVerificationCode(user.collectedData.phone, verificationCode, seriesCallback),
      seriesCallback => this.prompt(seriesCallback),
    ], callback);
    
  }

  prompt(callback) {
    this.stateManager.addPrompt(this.constructReply());
    this.pauseStateManager();
    callback(null);
  }

  failurePrompt(callback) {
    callback(null, false, this.constructFailurePrompt());
  }

  successPrompt(callback) {
    callback(null, true, this.constructSuccessPrompt());
  }

  verifyInput(callback) {
    console.log('Verifying Inputs in state input-sms-verify');
    let {incomingMessage, user} = this.stateManager.data;
    let smsVerificationCode = incomingMessage.text.trim().replace(/\s/g, '');
    let isSuccess = smsVerificationCode === user.collectedData.sms.verificationCode;
    // let isSuccess = smsVerificationCode === '000111' ;
    if(isSuccess) {
      this.setUserVerificationFlag(user, callback);
    } else {
      callback(null, isSuccess);
    }
  }

  setUserVerificationFlag(user, callback) {
    user.phoneIsVerified = true;
    user.nationalId = user.collectedData.nationalId;
    user.phone = user.collectedData.phone;
    user.save((err) => callback(err, true));
  }
}
module.exports = StateInputSmsVerification;

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}