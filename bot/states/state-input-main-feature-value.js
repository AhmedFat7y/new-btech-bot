"use strict";
const async = require('async');
const StateBase = require('./state-base');


class StateInputMainFeatureValue extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
    this.needsInputVerification = true;
  }

  constructReply(title, category) {
    const self = this;
    let quickReplies = category.options.map(option => {
      return {
        content_type: "text",
        title: option.label,
        payload: JSON.stringify({
          text: option.label,
          mainFeature: option

        })
      };
    });
    return {
      text: title,
      quick_replies: quickReplies,
    };
  }

  execute(callback) {
    let self = this;
    console.log('Executing State input MainFeatureValue');
    self.skipPrompt = false;
    let title = self.localesManager.questions.enterMainFeatureValue;
    self.getPromptMessage((err, category) => {
      self.managePrompts(self.constructReply(title, category), callback);
    });
  }

  getPromptMessage(callback) {
    let self = this;
    let categoryMagentoId = self.stateManager.data.user.filters.currentCategory.magentoId;
    async.waterfall([
      nextFunc => self.repo.getCategoryByMagentoId(categoryMagentoId).exec(nextFunc),
    ], callback);

  }

  constructSuccessPrompt() {
    return {
      text: "This is valid MainFeatureValue!"
    };
  }


  failurePrompt(callback) {
    let self = this;
    let title = self.localesManager.questions.enterMainFeatureValue;
    self.getPromptMessage((err, category) => {
      callback(null, false, self.constructReply(title, category));
    });

  }

  successPrompt(callback) {
    callback(null, true, this.constructSuccessPrompt());
  }

  verifyInput(callback) {
    console.log('Verifying Inputs in state input MainFeatureValue');
    let {incomingMessage, user} = this.stateManager.data;
    let mainFeature = incomingMessage.extraData.mainFeature;
    if (mainFeature && mainFeature.value) {
      if (mainFeature.value.constructor.name !== 'Array') {
        mainFeature.value = [mainFeature.value];
      }
      user.filters.mainFeature.searchValues = mainFeature.value;
      callback(null, true);
    } else {
      callback(null, false);
    }

  }

}

module.exports = StateInputMainFeatureValue;
