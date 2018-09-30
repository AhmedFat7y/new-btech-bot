
const async = require('async');

const StateBase = require('./state-base');
const { EVENT_TYPE } = require('../apis-wrappers/facebook-wrapper');
const STATE_NAME = 'StateAskAboutCategoryFilters';

// const getMainFeature = require('../resources/category-main-feature');
class StateAskAboutCategoryFilters extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
  }

  needsPostBackProcessing(incomingMessage) {
    return incomingMessage.type === EVENT_TYPE.POSTBACK && incomingMessage.extraData.processingState === STATE_NAME;
  }

  constructReply(category) {
    const self = this;
   
    let quickReplies = [
      {
        content_type: "text",
        title: self.localesManager.buttons.brands,
        payload: JSON.stringify({
          processingState: STATE_NAME,
          text: "brands",
          key: "categorySearchBrands"
        })
      },
      {
        content_type: "text",
        title: self.localesManager.buttons.pricing,
        payload: JSON.stringify({
          processingState: STATE_NAME,
          text: "pricing",
          key: "categorySearchPricing"
        })
      }
    ];
    //add offer button in case of at least one project of this category has offer
    category.hasOffer && quickReplies.push({
        content_type: "text",
        title: self.localesManager.buttons.offers,
        payload: JSON.stringify({
          processingState: STATE_NAME,
          text: "offers",
          key: "categorySearchOffers"
        })
      });
    category.mainFeatureText && quickReplies.push({
      content_type: "text",
      title: category.mainFeatureText,
      payload: JSON.stringify({
        processingState: STATE_NAME,
        text: category.mainFeatureText,
        key: "categorySearchMainFeature"
      })
    });
    return {
      text: self.localesManager.questions.pickCategoryFilter,
      quick_replies: quickReplies
    };
  }

  execute(callback) {
    console.log('Executing State category filters');
    let data = this.stateManager.data;
    let self = this;
    async.waterfall([
      nextFunc => {
        let userFilterCategory = data.user.filters.currentCategory.toObject();
        let { category, categoryId } = data.incomingMessage.extraData;
        if (category) {
          nextFunc(null, category);
        } else if (categoryId) {
          self.repo.getCategoryByMagentoId(categoryId).lean().exec(nextFunc);
        } else if (userFilterCategory) {
          nextFunc(null, userFilterCategory);
        } else {
          nextFunc({ msg: 'No Category Passed Here!' });
        }

      },
      (category, nextFunc) => {
        self.stateManager.data.user.switchToCategory(category);
        self.skipPrompt = false;
        self.managePrompts(self.constructReply(category), nextFunc)
      }
    ], callback)



  }

  processPostBack(callback) {
    let { incomingMessage, user } = this.stateManager.data;
    if (incomingMessage.extraData.text === 'offers') {
      user.filters.hasOffer = true;
    }
    callback(null);
  }
}

module.exports = StateAskAboutCategoryFilters;