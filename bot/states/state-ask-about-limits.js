"use strict";
const StateBase = require('./state-base');
const {REQUEST_TYPE} = require('../../db/models/user');
const {EVENT_TYPE} = require('../apis-wrappers/facebook-wrapper')
const STATE_NAME = 'StateAskAboutLimits';

class StateAskAboutLimits extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
  }
  needsPostBackProcessing(incomingMessage) {
    return incomingMessage.type === EVENT_TYPE.POSTBACK && incomingMessage.extraData.processingState === STATE_NAME;
  }
  constructReply() {
    const self = this;
    return {
      text: self.localesManager.questions.pickLimitYouWantToKnow,
      quick_replies: [
        {
          content_type: "text",
          title: self.localesManager.buttons.remainingInstallments,
          payload: JSON.stringify({
            processingState: STATE_NAME,
            text: "remaining installments",
            requestType: REQUEST_TYPE.REMAINING_INSTALLMENTS,
          })
        },
        {
          content_type: "text",
          title: self.localesManager.buttons.creditLimits,
          payload: JSON.stringify({
            processingState: STATE_NAME,
            text: "credit limit",
            requestType: REQUEST_TYPE.CREDIT_LIMIT,
          })
        }
      ]
    };
  }

  execute(callback) {
    console.log('Executing State askAboutLimits');
    this.skipPrompt = false;
    this.managePrompts(this.constructReply(), callback);
  }
  processPostBack(callback) {
    console.log('Verifying Inputs in state pick supported brand');
    let {incomingMessage, user} = this.stateManager.data;
    let requestType = incomingMessage.extraData.requestType;
    if (requestType) {
      user.collectedData.requestType = requestType;
    }
    callback(null);
  }
  getNextStatePosition({user}) {
    if (user.phoneIsVerified) {
      // skip and go to last step to display data
      return {
        stream: 'askAboutLimits',
        index: 3,
      }
    } else {
      return super.getNextStatePosition(...arguments);
    }
  }
}
module.exports = StateAskAboutLimits;
