"use strict";
const StateBase = require('./state-base');

const refrigeratorsCategory = {name: 'Refrigerators', id: 15};

class StateAskAboutRefrigeratorsFilters extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
  }

  constructReply() {
    const self = this;
    return {
      text: self.localesManager.questions.pickRefrigeratorsFilter,
      quick_replies: [
        {
          content_type: "text",
          title: self.localesManager.buttons.brands,
          payload: JSON.stringify({
            text: "brands",
            key: "refrigeratorsSearchBrands"
          })
        },
        {
          content_type: "text",
          title: self.localesManager.buttons.pricing,
          payload: JSON.stringify({
            text: "pricing",
            key: "productsSearchPricing"
          })
        },
        {
          content_type: "text",
          title: self.localesManager.buttons.height,
          payload: JSON.stringify({
            text: "height",
            key: "refrigeratorsSearchHeight"
          })
        },
      ]
    };
  }

  execute(callback) {
    console.log('Executing State category Refrigerator');
    this.stateManager.data.user.switchToCategory(refrigeratorsCategory);
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    this.stateManager.addPrompt(this.constructReply());
    this.pauseStateManager();
    callback(null);
  }
}

module.exports = StateAskAboutRefrigeratorsFilters;