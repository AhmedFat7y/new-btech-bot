"use strict";
const StateBase = require('./state-base');
class StateAskAboutPayment extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
  }

  constructReply() {
    const self = this;
    return {
      text: self.localesManager.questions.pickPayment,
      quick_replies: [
        {
          content_type: "text",
          title: self.localesManager.buttons.cash,
          payload: JSON.stringify({
            text: "Cash",
            key: "paymentCash"
          })
        },
        {
          content_type: "text",
          title: self.localesManager.buttons.miniCash,
          payload: JSON.stringify({
            text: "Mini Cash",
            key: "paymentMiniCash"
          })
        }
      ]
    };
  }

  execute(callback) {
    console.log('Executing State ask about payment');
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    this.stateManager.addPrompt(this.constructReply());
    this.pauseStateManager();
    callback(null);
  }
}

module.exports = StateAskAboutPayment;