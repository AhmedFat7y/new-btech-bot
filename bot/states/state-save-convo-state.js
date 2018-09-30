"use strict";
const StateBase = require('./state-base');
const async = require('async');

class StateSaveConvoState extends StateBase {
  execute(callback) {

    let data = this.stateManager.data;
    let {nextStatePosition, message, user} = this.stateManager.data;
    let stateClass = (nextStatePosition && this.stateManager.getStateClass(nextStatePosition)) || {};
    let prompt = this.stateManager.prompt || [];
    let isFailure = this.stateManager.isFailure || false;
    console.log('Saving conversation state:', user.fbId, nextStatePosition, stateClass.name);
    prompt.forEach(replyMessage => {
      replyMessage && message.replies.push(replyMessage);
    });
    message.statePosition = nextStatePosition;
    message.replied = data.isPromptSent;
    message.isFailure = isFailure;
    message.markModified('statePosition');
    message.markModified('replies');
    async.parallel([
      parallelCallback => message.save((err) => {
        if (err) {
          console.error('Error updating the message!', err);
        }
        console.log('Updated Message', message.fbId, message.id);
        parallelCallback(err);
      }),
      parallelCallback => user.save((err) => {
        if (err) {
          console.error('Error updating the message!', err);
        }
        console.log('Updated User', user.fbId);
        parallelCallback(err);
      })
    ], err => {
      callback(err);
    });
  }
}
module.exports = StateSaveConvoState;