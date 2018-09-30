"use strict";
const StateBase = require('./state-base');
const async = require('async');
const {EVENT_TYPE} = require('../apis-wrappers/facebook-wrapper');
const STATE_NAME = 'StatePickSupportedBrand';

class StatePickSupportedBrand extends StateBase {
  constructor(stateManager) {
    super(...arguments);
    this.pause = true;
    this.repo = stateManager.repo;
  }
  needsPostBackProcessing(incomingMessage) {
    return incomingMessage.type === EVENT_TYPE.POSTBACK && incomingMessage.extraData.processingState === STATE_NAME;
  }
  constructReply(brands) {
    const self = this;
    let quickReplies = brands.map(brand => {
      return {
        title: brand.name,
        content_type: "text",
        payload: JSON.stringify({
          processingState: STATE_NAME,
          text: brand.name,
        })
      }
    });
    quickReplies.push({
      title: self.localesManager.buttons.other,
      content_type: "text",
      payload: JSON.stringify({
        processingState: STATE_NAME,
        text: 'Other',
        key: 'maintenanceNotSupportedBrand'
      })
    })
    return [
      {
        text: self.localesManager.questions.pickSupportedBrand,
        quick_replies: quickReplies
      },
    ]
  }

  execute(callback) {
    console.log('Executing State pick maintenance brand');
    this.prompt(callback);

  }

  prompt(callback) {
    let self = this;
    let {categoryMagentoId} = self.stateManager.data.incomingMessage.extraData;
    async.waterfall([
      nextFunc => self.repo.getSupportedBrands(categoryMagentoId, nextFunc),
    ], (err, brands) => {
      self.managePrompts(self.constructReply(brands));
      callback(null);
    });
  }

  processPostBack(callback) {
    console.log('Verifying Inputs in state pick supported brand');
    let {incomingMessage, user} = this.stateManager.data;
    let pickedBrandTitle = incomingMessage.extraData.text;
    if (pickedBrandTitle) {
      user.collectedData.productBrand = pickedBrandTitle;
    }
    callback(null);
  }
}

module.exports = StatePickSupportedBrand;