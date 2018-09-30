
const StateBase = require('./state-base');
const async = require('async');
const ProductsSearcher = require('../apis-wrappers/local-products-searcher');
const ProductsFormatter = require('../bot-utilities/products-fb-list-formatter');
const config = require('../../config');


class StateListDailyDeals extends StateBase {
  constructor(stateManager) {
    super(...arguments);
    this.pause = true;
    this.productsSearcher = new ProductsSearcher(stateManager);
  }

  createProductsFormatter(filters, searchResult) {
    let self = this;
    let viewMoreButton = {
      title: self.localesManager.buttons.viewMore,
      payload: {
        key: "dailyDeals",
        totalCount: filters.totalCount,
        filters,
      }
    };
    let contentTitles = {
      firstPageTitle: self.localesManager.phrases.hereAreSomeProducts,
      morePagesTitle: self.localesManager.phrases.hereAreSomeMoreProducts,
      lastPageTitle: self.localesManager.phrases.lastProductsPage,
      emptyListTitle: self.localesManager.phrases.emptyProductsList,
      checkWebsite: self.localesManager.buttons.checkWebsite,
      promotionalItemTitle: self.localesManager.phrases.youCanCheckOtherCategoriesOrFilters,
    };
    let promotionalItemQuickReplies = [
      {
        title: self.localesManager.buttons.mainMenu,
        payload: {
          key: 'hi',
        }
      }, {
        title: self.localesManager.buttons.otherFilters,
        payload: {
          key: 'categoryFilters',
        }
      }, {
        title: self.localesManager.buttons.otherCategories,
        payload: {
          key: 'shopping',
        }
      }
    ];

    return new ProductsFormatter(searchResult, filters, self.stateManager, contentTitles, promotionalItemQuickReplies, viewMoreButton);
  }

  constructReply(filters, searchResult) {
    return this.createProductsFormatter(filters, searchResult).format();
  }

  execute(callback) {
    const self = this;
    console.log('Executing State list daily deals');
    let filters = this.stateManager.data.incomingMessage.extraData.filters || {};

    //I added this line of code to set the user's category to daily-deals
    this.stateManager.data.user.filters.hasOffer = true,
    
    async.waterfall([
      nextFunc => this.productsSearcher.getDailyDealsProducts(filters, nextFunc),
      (resultFilters, searchResult, nextFunc) => self.prompt(resultFilters, searchResult, () => {
        nextFunc(null, searchResult);
      })
    ], (err, searchResult) => {
      if (err) {
        console.error('Getting Products to show:', err);
      }
      self.stateManager.data.searchResult = searchResult;
      callback(null);
    });
  }

  prompt(filters, searchResult, callback) {
    this.managePrompts(this.constructReply(filters, searchResult));
    this.pauseStateManager();
    callback(null);
  }
}

module.exports = StateListDailyDeals;
