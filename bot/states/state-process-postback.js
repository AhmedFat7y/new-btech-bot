"use strict";
const StateBase = require('./state-base');
const async = require('async');

class StateProcessPostBack extends StateBase {
  constructor(stateManager) {
    super(...arguments);
  }

  execute(callback) {
    console.log('Executing State process postback');
    let {latestValidState} = this.stateManager.data;
    latestValidState.processPostBack(callback);
  }
}

module.exports = StateProcessPostBack;