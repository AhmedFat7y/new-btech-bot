"use strict";
const StateBase = require('./state-base');
class StateChangeLanguage extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
  }

  constructReply() {
    const self = this;
    return [
      {text: self.localesManager.phrases.changeLanguage},
      this.getImageServicesMessage()
    ];
  }

  execute(callback) {
    console.log('Executing State Ending');
    this.skipPrompt = false;
    this.stateManager.localesManager.toggleLanguage();
    this.stateManager.data.user.toggleLanguage();
    this.prompt(callback);
  }

  prompt(callback) {
    this.stateManager.addPrompt(this.constructReply());
    this.pauseStateManager();
    callback(null);
  }

}
module.exports = StateChangeLanguage;