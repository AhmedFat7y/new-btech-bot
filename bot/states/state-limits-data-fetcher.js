"use strict";
const StateBase = require('./state-base');
const unifonicAPI = require('../apis-wrappers/unifonic-wrapper');

class StateLimitsDataFetcher extends StateBase {
  constructor(stateManager) {
    super(...arguments);
  }

  constructReply() {
    const self = this;
    return {
      text: self.localesManager.phrases.hereAreYourLimits
    }
  }


  getData(callback) {
    unifonicAPI.sendMessage('+201000200079', 'Hello World', callback);
  }

  execute(callback) {
    console.log('Executing State categories');
    // get data
    this.prompt(callback);
  }

  prompt(callback) {
    this.managePrompts(this.constructReply());
    this.pauseStateManager();
    callback(null);
  }
}

module.exports = StateLimitsDataFetcher;