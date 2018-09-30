"use strict";
const StateBase = require('./state-base');
const mobilesCategory = {name: 'Mobiles', id: 48};


class StateAskAboutMobilesFilters extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
  }

  constructReply() {
    const self = this;
    return {
      text: self.localesManager.questions.pickCategoryFilter,
      quick_replies: [
        {
          content_type: "text",
          title: self.localesManager.buttons.brands,
          payload: JSON.stringify({
            text: "brands",
            key: "mobilesSearchBrands"
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
          title: self.localesManager.buttons.ram,
          payload: JSON.stringify({
            text: "ram",
            key: "mobilesSearchRAM"
          })
        },
      ]
    };
  }

  execute(callback) {
    console.log('Executing State category mobile');
    this.stateManager.data.user.switchToCategory(mobilesCategory);
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    this.stateManager.addPrompt(this.constructReply());
    this.pauseStateManager();
    callback(null);
  }
}

module.exports = StateAskAboutMobilesFilters;