"use strict";
const StateBase = require('./state-base');
class StateInputDownPayment extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
    this.needsInputVerification = true;
    this.regex = /^\+?\d+$/g;
  }

  constructReply() {
    const self = this;
    return {
      text: self.localesManager.questions.enterYourDownPayment
    };
  }

  constructFailurePrompt() {
    const self = this;
    return {
      text: self.localesManager.validations.enterValidMoneyAmount
    };
  }

  constructSuccessPrompt() {
    return {
      text: "This is valid MoneyAmount Number!"
    };
  }

  execute(callback) {
    console.log('Executing State input down payment');
    this.skipPrompt = false;
    this.prompt(callback);
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
    console.log('Verifying Inputs in state input-down payment');
    let {incomingMessage, user} = this.stateManager.data;
    let moneyAmount = incomingMessage.text.trim();
    let isSuccess = this.regex.test(moneyAmount);
    if (isSuccess) {
      user.filters.pricing.downPayment = moneyAmount;
    }
    callback(null, isSuccess);
  }
}
module.exports = StateInputDownPayment;