"use strict";
const StateBase = require('./state-base');
const StateHandleRandomInputs = require('./state-handle-random-inputs');


class StateDecideNextStep extends StateBase {
  execute(callback) {
    let data = this.stateManager.data;
    let {latestValidStatePosition, incomingMessage, user} = this.stateManager.data;
    let messageIncludesState = incomingMessage.extraData.stream;

    let prevStateClass = null;
    if (!latestValidStatePosition) {
      latestValidStatePosition = {stream: 'hi', index: 0};
      data.latestValidStatePosition = latestValidStatePosition;
      console.log('Latest valid state position was null reset to hi');
    }
    console.log('Deciding Next Step From:', latestValidStatePosition);
    if (messageIncludesState) {
      console.log('User Wants to go to:', incomingMessage.extraData);
    }
    let nextStatePosition = null;
    if (messageIncludesState) { // if message includes state, override the states flow
      nextStatePosition = {stream: incomingMessage.extraData.stream, index: incomingMessage.extraData.index || 0};
      data.latestValidState = null;
    } else if (latestValidStatePosition) {
      // getStateClass: returns the state from streams using the key and index.
      prevStateClass = this.stateManager.getStateClass(latestValidStatePosition);
      // if previous state found start on deciding the next step.
      if (prevStateClass) {
        nextStatePosition = new prevStateClass(this.stateManager).getNextStatePosition(data);
        data.latestValidState = new prevStateClass(this.stateManager, this.stateManager.localesManager);
      } else {
        data.latestValidState = new StateHandleRandomInputs(this.stateManager, this.stateManager.localesManager);
        nextStatePosition = {stream: 'hi', index: 0};
      }
    } else {
      nextStatePosition = {stream: 'hi', index: 0};
      data.latestValidState = null;
    }
    if (latestValidStatePosition.stream === 'reportIssue' && nextStatePosition.stream !== 'reportIssue') {
      user.complaint = [];
    }
    console.log('Next Step is:', nextStatePosition);
    data.nextStatePosition = nextStatePosition;
    callback(null);
  }
}
module.exports = StateDecideNextStep;
