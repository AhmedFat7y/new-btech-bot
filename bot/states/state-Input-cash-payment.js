"use strict";
const async = require('async');
const StateBase = require('./state-base');
const Repo = require('../../db/repos/repo');
class StateInputMoneyAmount extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
    this._needsPostBackProcessing = true;
  }
  constructReply(category) {
    const self = this;
    console.log('Category', category);
    console.log('Cash options:', category.cashOptions);
    let quickReplies = category.cashOptions.map(cashOption => {
      return {
        content_type: "text",
        title: cashOption.label,
        payload: JSON.stringify({
          text: cashOption.label,
          cashOption
        })
      };
    });
    return {
      text: self.localesManager.phrases.hereAreSomeProducts,
      quick_replies: quickReplies,
    };
  }

  execute(callback) {
    console.log('Executing State input MoneyAmount');
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    let {incomingMessage, user} = this.stateManager.data;
    let categoryId = user.filters.currentCategory.magentoId;
    let categoryq= this.repo.getCategoryByMagentoId(categoryId);
    let self = this;
    async.waterfall([
      nextFunc => categoryq.exec(nextFunc),
      (category, nextFunc) => self.managePrompts(self.constructReply(category), nextFunc),
    ], callback)
  }

  processPostBack(callback) {
    let {user, incomingMessage} = this.stateManager.data;
    user.filters.pricing.cash = incomingMessage.extraData.cashOption.value;
    callback(null);
  }

  // constructFailurePrompt() {
  //   const self = this;

  //   self.getPromptMessage((err, category) => {
  //     callback(null, false, self.constructReply( category));
  //   });
  // }

  // constructSuccessPrompt() {
  //   return {
  //     text: "This is valid MoneyAmount Number!"
  //   };
  // }
  // failurePrompt(callback) {
  //   callback(null, false, this.constructFailurePrompt());
  // }

  // successPrompt(callback) {
  //   callback(null, true, this.constructSuccessPrompt());
  // }

  // verifyInput(callback) {
  //   console.log('Verifying Inputs in state input-MoneyAmount');
  //   let {incomingMessage, user} = this.stateManager.data;
  //   let { category, categoryId } = incomingMessage.extraData
  //   let moneyAmount = incomingMessage.text.trim();
  //   let isSuccess = this.regex.test(moneyAmount);
  //   if (isSuccess) {
  //     user.filters.pricing.cash = moneyAmount;
  //   }
  //   callback(null, isSuccess);
  // }
}
module.exports = StateInputMoneyAmount;
