"use strict";
const async = require('async');
const StateBase = require('./state-base');
class StateInputInstallment extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
    //this.needsInputVerification = true;
    // this.regex = /^\+?\d+$/g;
  }

  constructReply(category) {
    const self = this;
    let quickReplies = category.minicashOptions.map(minicashOption => {
      return {
        content_type: "text",
        title: minicashOption.label,
        payload: JSON.stringify({
          text: minicashOption.label,
          minicashOption
        })
      };
    });
    return [
      {
        text: self.localesManager.phrases.hereAreSomeProducts,
        quick_replies: quickReplies,
       }
    ];
  }

  execute(callback) {
    console.log('Executing State input installment');
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    let {incomingMessage, user} = this.stateManager.data;
    let categoryId = user.filters.currentCategory.magentoId;
    let categoryq= this.repo.getCategoryByMagentoId(categoryId);
    let self = this;
    self.pauseStateManager();
    async.waterfall([
      nextFunc => categoryq.exec(nextFunc),
      (category, nextFunc) => self.managePrompts(self.constructReply(category), nextFunc),
    ], callback)
  }

  processPostBack(callback) {
    let {user, incomingMessage} = this.stateManager.data;
    user.filters.pricing.installment = incomingMessage.extraData.miniCashOption.value;
    callback(null);
  }

  // constructFailurePrompt() {
  //   const self = this;
  //   return {
  //     text: self.localesManager.validations.enterValidMoneyAmount
  //   };
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
  //   console.log('Verifying Inputs in state input-installment');
  //   let {incomingMessage, user} = this.stateManager.data;
  //   console.log(user);
  //   //let { category, categoryId } = incomingMessage.extraData
  //   let moneyAmount = incomingMessage.text.trim();
  //   let isSuccess = this.regex.test(moneyAmount);
  //   if (isSuccess) {
  //     user.filters.pricing.installment = moneyAmount;
  //   }
  //   callback(null, isSuccess);
  // }
}
module.exports = StateInputInstallment;
