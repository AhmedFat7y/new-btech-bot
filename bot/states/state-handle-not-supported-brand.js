"use strict";
const StateBase = require('./state-base');
const async = require('async');

class StatePickNotSupportedBrand extends StateBase {
  constructor(stateManager) {
    super(...arguments);
    this.pause = true;
    this.repo = stateManager.repo;
  }

  constructReply() {
    const self = this;
    if (self.notSupportedBrand) {
      return [
        {
          // any new lines or empty spaces in strings with backticks will be preserved so we need to break the indentation here for now
          text: self.localesManager.phrases.hereIsSomInfoAboutNotSupportedBrand + self.notSupportedBrand.hotline,
        },
        self.getImageServicesMessage()
      ]
    } else {
      return [
        {
          text: self.localesManager.phrases.noInfoAboutOtherBrands
        },
        self.getImageServicesMessage()
      ]
    }
  }

  execute(callback) {
    let self = this;
    console.log('Executing State pick not supported maintenance brand');
    let {incomingMessage} = self.stateManager.data;
    self.notSupportedBrand = null;
    if (incomingMessage.extraData.hotline) {
      self.notSupportedBrand = {
        name: incomingMessage.extraData.text,
        hotline: incomingMessage.extraData.hotline,
      }
    }
    self.prompt(callback);
  }

  prompt(callback) {
    let self = this;
    self.managePrompts(self.constructReply());
    callback(null);
  }
}

module.exports = StatePickNotSupportedBrand;