"use strict";
const StateBase = require('./state-base');
class StateAskAboutDownPayment extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
  }

  constructReply() {
    const self = this;
    return {
      text: self.localesManager.questions.wouldYouPayDownPayment,
      quick_replies: [
        {
          content_type: "text",
          title: self.localesManager.buttons.yes,
          payload: JSON.stringify({
            text: "Yes",
            key: "paymentMiniCashDownPayment"
          })
        },
        {
          content_type: "text",
          title: self.localesManager.buttons.no,
          payload: JSON.stringify({
            text: "No",
            key: "paymentMiniCashNoDownPayment"
          })
        }
      ]
    };
  }

  execute(callback) {
    console.log('Executing State category Refrigerator');
    this.stateManager.data.user.filters.currentFiltersName = 'refrigeratorsFilters';
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    this.stateManager.addPrompt(this.constructReply());
    this.pauseStateManager();
    callback(null);
  }
}

module.exports = StateAskAboutDownPayment;