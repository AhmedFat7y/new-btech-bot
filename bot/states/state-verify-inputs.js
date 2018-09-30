"use strict";
const StateBase = require('./state-base');
const async = require('async');
class StateVerifyInputs extends StateBase {
  constructor(stateManager) {
    super(...arguments);
  }

  setIsFailure(failureFlag) {
    this.stateManager.setIsFailure(failureFlag);
    this.pause = failureFlag;
  }

  execute(callback) {
    let self = this;
    console.log('Executing State verify input');
    let {user, latestValidState} = this.stateManager.data;
    async.waterfall([
      nextFunc => latestValidState.verifyInput(nextFunc),
      
      (isSuccess, nextFunc) => {
        isSuccess ?
          latestValidState.successPrompt(nextFunc) :
          latestValidState.failurePrompt(nextFunc);
      }
    ], (err, isSuccess, prompt) => {
      this.setIsFailure(!isSuccess);
      if (!isSuccess) {
        user.incremenetInvalidMessagesCounter();
        this.managePrompts(prompt, callback);
      } else {
        user.clearInvalidMessages();
        this.stateManager.clearVerificationFlags();
        callback(null);
      }
    });
  }
}
module.exports = StateVerifyInputs;
