const async = require('async');
const StateBase = require('./state-base');
// const categoryBrands = require('../resources/category-brand');
const speakNLP = require("speakeasy-nlp");

class StatePickCategoryBrand extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
    this.skipPrompt = false;
  }

  constructReply(brandsList) {
    const self = this;
    let brandsListReplies = brandsList.map(brand => {
      return {
        content_type: "text",
        title: brand.name,
        payload: JSON.stringify({
          text: brand.name,
          brand
        })
      }
    })
    let message = {
      text: self.localesManager.questions.pickCategoryBrand,
      quick_replies: brandsListReplies
    };
    return message;
  }

  execute(callback) {
    const self = this;
    let { user } = self.stateManager.data;
    console.log('Executing State pick category brand');
    async.waterfall([
      nextFunc => self.repo.getCategoryBrands(user.filters.currentCategory.magentoId).lean().exec(nextFunc),
      (categoryBrands, nextFunc) => this.managePrompts(this.constructReply(categoryBrands.brands), nextFunc)
    ], callback);

  }
  constructFailurePrompt() {
    const self = this;
    return {
      text: self.localesManager.validations.enterValidBrand,
    };
  }

  constructSuccessPrompt() {
    return {
      text: "This is a valid Brand!"
    };
  }

  needsPostBackProcessing(incomingMessage) {
    return !!(incomingMessage.extraData.brand);
  }

  processPostBack(callback) {
    let { incomingMessage, user } = this.stateManager.data;
    user.filters.brand = incomingMessage.extraData.brand;
    callback(null);
  }
}
module.exports = StatePickCategoryBrand;
