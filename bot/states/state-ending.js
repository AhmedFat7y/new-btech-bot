"use strict";
const StateBase = require('./state-base');
class StateEnding extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
  }

  constructReply() {
    // const self = this;
    return this.getImageServicesMessage();
  }

  execute(callback) {
    console.log('Executing State Ending');
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    this.stateManager.addPrompt(this.constructReply());
    this.pauseStateManager();
    callback(null);
  }

}
module.exports = StateEnding;