"use strict";
const StateBase = require('./state-base');

const microwaveCategory = {name: 'Microwaves', id: 19};

class StateAskAboutMicrowavesFilters extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
  }

  constructReply() {
    const self = this;
    return {
      text: self.localesManager.questions.pickMicrowavesFilter,
      quick_replies: [
        {
          content_type: "text",
          title: self.localesManager.buttons.brands,
          payload: JSON.stringify({
            text: "brands",
            key: "microwavesSearchBrands"
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
          title: self.localesManager.buttons.capacity,
          payload: JSON.stringify({
            text: "ram",
            key: "microwavesSearchCapacity"
          })
        },
      ]
    };
  }

  execute(callback) {
    console.log('Executing State category Microwave');
    this.stateManager.data.user.switchToCategory(microwaveCategory);
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    this.stateManager.addPrompt(this.constructReply());
    this.pauseStateManager();
    callback(null);
  }
}

module.exports = StateAskAboutMicrowavesFilters;