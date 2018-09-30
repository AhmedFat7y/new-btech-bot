"use strict";
const StateBase = require('./state-base');
class StateReportIssue extends StateBase {
  constructor() {
    super(...arguments);
    this.pause = true;
    this.needsInputVerification = true;
  }

  constructReply() {
    const self = this;
    return [
      {
        text: self.localesManager.questions.whatIsYourFeedback
      }
    ];
  }

  execute(callback) {
    console.log('Executing State report an issue');
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    this.stateManager.addPrompt(this.constructReply());
    this.pauseStateManager();
    callback(null);
  }
  constructSuccessPrompt() {
    return 'Valid complaint';
  }

  failurePrompt(callback) {
    callback(null, false, this.constructFailurePrompt());
  }

  successPrompt(callback) {
    callback(null, true, this.constructSuccessPrompt());
  }

  verifyInput(callback) {
    console.log('Verifying Inputs in state-report-issue');
    let {incomingMessage, user} = this.stateManager.data;
    user.complaint.push(incomingMessage.text);

    callback(null, true);
  }

}

module.exports = StateReportIssue;
