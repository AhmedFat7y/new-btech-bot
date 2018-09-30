const StateBase = require('./state-base');
const async = require('async');
const ProductsSearcher = require('../apis-wrappers/local-products-searcher');
const ProductsFormatter = require('../bot-utilities/products-fb-list-formatter');
const config = require('../../config');


class StateListProductPrices extends StateBase {
  constructor(stateManager) {
    super(...arguments);
    this.pause = true;
    this.productsSearcher = new ProductsSearcher(stateManager);
    this.productsFormatter = new ProductsFormatter(null, null, this.stateManager);
  }
  getDefaultReply() {
    const self = this;
    return {
      text: self.localesManager.phrases.youCanCheckOtherCategoriesOrFilters,
      quick_replies: [
        {
          title: self.localesManager.buttons.mainMenu,
          content_type: "text",
          payload: JSON.stringify({
            key: 'hi',
          })
        }, {
          title: self.localesManager.buttons.otherFilters,
          content_type: "text",
          payload: JSON.stringify({
            key: 'categoryFilters',
          })
        }, {
          title: self.localesManager.buttons.otherCategories,
          content_type: "text",
          payload: JSON.stringify({
            key: 'shopping',
          })
        }
      ]
    };
  }
  constructReply(product, previousMessage) {
    let self = this;
    let locale = self.localesManager.getLocale();
    let previousReply = null;
    let statePosition = previousMessage.statePosition;
    let previousStateClass = statePosition && self.stateManager.getStateClass(statePosition);
    
    if(previousStateClass && previousStateClass.name === 'StateShowProductsList') {
      previousReply = previousMessage.replies.pop();
    }
    return [
      self.productsFormatter.formatProductPrices(product),
      {
        text: self.localesManager.phrases.youCanCheckItOnWebsite + ` https://www.example.com/${locale}/${product.urlKey}.html?source=bibo&platform=messenger`
      },
      previousReply || self.getDefaultReply()
    ];
  }
  
  getNeededData(product, callback) {
    const self = this;
    let fbId = self.stateManager.data.user.fbId;
    async.parallel([
      parallelCallback => this.productsSearcher.getProduct(product.magentoId, parallelCallback),
      parallelCallback => this.repo.getPreviousMessage(fbId).lean().exec(parallelCallback),
    ], callback);
  }
  
  execute(callback) {
    const self = this;
    self.stateManager.data.nextStatePosition = self.stateManager.data.latestValidStatePosition;
    console.log('Executing State list product prices');
    let product = this.stateManager.data.incomingMessage.extraData.product || {};
    async.waterfall([
      nextFunc => self.getNeededData(product, nextFunc),
      ([productData, previousMessage], nextFunc) => self.managePrompts(self.constructReply(productData, previousMessage), nextFunc),
    ], callback);
  }
}

module.exports = StateListProductPrices;
