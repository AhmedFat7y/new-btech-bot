"use strict";
const StateBase = require('./state-base');
const async = require('async');
const {EVENT_TYPE} = require('../apis-wrappers/facebook-wrapper');
const STATE_NAME = 'StatePickSupportedCategory';

class StatePickSupportedCategory extends StateBase {
  constructor(stateManager) {
    super(...arguments);
    this.pause = true;
    this.repo = stateManager.repo;
  }
  needsPostBackProcessing(incomingMessage) {
    return incomingMessage.type === EVENT_TYPE.POSTBACK && incomingMessage.extraData.processingState === STATE_NAME;
  }
  constructReply(categories) {
    const self = this;
    return [
      {
        text: self.localesManager.questions.pickSupportedCategory,
        quick_replies: categories.map(category => {
          return {
            title: category.name,
            content_type: "text",
            payload: JSON.stringify({
              processingState: STATE_NAME,
              text: category.normalizedName,
              categoryMagentoId: category.magentoId,
            })
          }
        })
      },
    ]
  }

  execute(callback) {
    console.log('Executing State pick maintenance category');
    this.prompt(callback);

  }

  prompt(callback) {
    let self = this;
    async.waterfall([
      nextFunc => self.repo.getSupportedCategories().lean().exec(nextFunc)
    ], (err, categories) => {
      self.managePrompts(self.constructReply(categories));
      callback(null);
    });
  }

  processPostBack(callback) {
    console.log('Verifying Inputs in state pick supported category');
    let {incomingMessage, user} = this.stateManager.data;
    let pickedCategoryTitle = incomingMessage.extraData.text;
    if (pickedCategoryTitle) {
      user.collectedData.productCategory = pickedCategoryTitle;
    }
    callback(null);
  }
}

module.exports = StatePickSupportedCategory;