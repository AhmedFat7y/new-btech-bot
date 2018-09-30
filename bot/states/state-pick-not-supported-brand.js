"use strict";
const StateBase = require('./state-base');
const async = require('async');

class StatePickNotSupportedBrand extends StateBase {
  constructor(stateManager) {
    super(...arguments);
    this.pause = true;
    this.repo = stateManager.repo;
  }

  constructReply(brandsTitles) {
    const self = this;
    let quickReplies = brandsTitles.value.map(notSupportedBrand => {
      return {
        title: notSupportedBrand.name,
        content_type: "text",
        payload: JSON.stringify({
          text: notSupportedBrand.name,
          hotline: notSupportedBrand.hotline,
        })
      }
    });
    quickReplies.push({
      title: self.localesManager.buttons.other,
      content_type: "text",
      payload: JSON.stringify({
        text: 'Other',
      })
    })
    return [
      {
        text: self.localesManager.phrases.noMaintenanceForOtherBrands
      },
      {
        text: self.localesManager.questions.pickNotSupportedBrand,
        quick_replies: quickReplies
      },
    ]
  }

  execute(callback) {
    console.log('Executing State pick not supported maintenance brand');
    this.prompt(callback);

  }

  prompt(callback) {
    let self = this;
    async.waterfall([
      nextFunc => self.repo.getNotSupportedBrands().exec(nextFunc)
    ], (err, brandsTitles) => {
      self.managePrompts(self.constructReply(brandsTitles));
      callback(null);
    });
  }
}

module.exports = StatePickNotSupportedBrand;