"use strict";
const StateBase = require('./state-base');
const fbapi = require('../apis-wrappers/facebook-wrapper');

class StateSendPrompt extends StateBase {
  execute(callback) {
    let prompt = this.stateManager.prompt;
    if (!(prompt instanceof Array)) {
      prompt = [prompt];
      this.stateManager.prompt = prompt;
    }
    let data = this.stateManager.data;
    if (prompt && prompt.length > 0) {
      data.isPromptSent = true;
      fbapi.sendMessages(data.user.fbId, prompt, callback);
    } else {
      console.warn('No Data to send to user!');
      callback(null);
    }
  }
}
module.exports = StateSendPrompt;