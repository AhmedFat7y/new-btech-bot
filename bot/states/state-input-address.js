"use strict";
const StateBase = require('./state-base');
// const
class StateInputAddress extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
    this.needsInputVerification = true;
  }

  constructReply() {
    const self = this;
    return {
      text: self.localesManager.questions.enterYourAddress
    };
  }

  execute(callback) {
    console.log('Executing State input address');
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    this.managePrompts(this.constructReply(), callback);
  }


  constructFailurePrompt() {
    const self = this;
    return {
      text: self.localesManager.validations.enterValidAddress
    };
  }

  constructSuccessPrompt() {
    return {
      text: "This is valid address!"
    };
  }


  failurePrompt(callback) {
    callback(null, false, this.constructFailurePrompt());
  }

  successPrompt(callback) {
    callback(null, true, this.constructSuccessPrompt());
  }

  verifyInput(callback) {
    console.log('Verifying Inputs in state input address');
    let {incomingMessage, user} = this.stateManager.data;
    user.collectedData.address = incomingMessage.text.trim();
    callback(null, true);
  }

}

module.exports = StateInputAddress;