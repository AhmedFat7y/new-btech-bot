const StateBase = require('./state-base');
const brands = require('../resources/mobile-brands');
const speakNLP = require("speakeasy-nlp");

class StatePickMobileBrand extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
    this.needsInputVerification = true;
  }

  constructReply() {
    const self = this;
    let message = {
      text: self.localesManager.questions.pickCategoryBrand,
      quick_replies: []
    };
    Object.keys(brands).forEach(brandKey => {
      message.quick_replies.push({
        content_type: "text",
        title: brandKey,
        payload: JSON.stringify({
          text: brandKey,
          brand: {
            name: brandKey,
            id: brands[brandKey]
          }
        })
      });
    });
    return message;
  }

  execute(callback) {
    console.log('Executing State pick mobile brand');
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    this.stateManager.addPrompt(this.constructReply());
    this.pauseStateManager();
    callback(null);
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

  verifyInput(callback) {
    console.log('Verifying Inputs in state pick a mobile brand');
    let {incomingMessage, user} = this.stateManager.data;
    let pickedBrand = incomingMessage.extraData.brand;
    let brandName = incomingMessage.text;
    let mobilesFilters = user.filters;
    if (!pickedBrand && brandName) {
      brandName = speakNLP.closest(brandName, Object.keys(brands));
      pickedBrand = {
        name: brandName,
        id: brands[brandName]
      };
    }
    mobilesFilters.brand = pickedBrand;
    // testing only
    // this.managePrompts(this.constructSuccessPrompt(), () => {
    // });
    callback(null, pickedBrand && true);
  }
}
module.exports = StatePickMobileBrand;