"use strict";
const StateBase = require('./state-base');

class StateInputName extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
    this.needsInputVerification = true;
  }

  constructReply() {
    const self = this;
    return {
      text: self.localesManager.questions.enterYourName,
    };
  }


  execute(callback) {
    console.log('Executing State input name');
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    this.managePrompts(this.constructReply(), callback);
  }

  constructFailurePrompt() {
    const self = this;
    return {
      text: self.localesManager.validations.enterValidName,
    };
  }

  constructSuccessPrompt() {
    return {
      text: "This is valid Name!"
    };
  }
  failurePrompt(callback) {
    callback(null, false, this.constructFailurePrompt());
  }

  successPrompt(callback) {
    callback(null, true, this.constructSuccessPrompt());
  }

  verifyInput(callback) {
    console.log('Verifying Inputs in state input name');
    let {incomingMessage, user} = this.stateManager.data;
    user.collectedData.name = incomingMessage.text.trim();
    callback(null, true);
  }

}
module.exports = StateInputName;