const customIntl = require('intl');

// const genericTemplateElementsMax = 10;
const config = require('../../config');
const basePageNumber = 0;

/* titlesToBeUsed = {
 firstPageTitle: '',
 morePagesTitle: '',
 lastPageTitle: '',
 emptyListTitle: '',
 }
 promotionalItemQuickReplies = [
 {
 title: '',
 payload: '',
 }
 ]
 viewMoreButton = {
 title: '',
 payload: '',
 }
 */

class ProductsFbFormatter {
  constructor(productsList, filters, stateManager, contentTitles, promotionalItemQuickReplies, viewMoreButton) {
    this.productsList = productsList || [];
    this.filters = filters || {};
    this.contentTitles = contentTitles;
    this.promotionalItemQuickReplies = promotionalItemQuickReplies;
    this.viewMoreButton = viewMoreButton;
    this.stateManager = stateManager;
    this.initialize();
  }
  initialize() {
    let filters = this.filters, stateManager = this.stateManager;
    this.localesManager = stateManager.localesManager;
    this.isLastPage = true;
    this.isFirstPage = filters.currentPageNumber === basePageNumber;
    let numberOfRemainingItems = getNumberOfRemainingItems(basePageNumber, filters.totalCount, filters.currentPageNumber);
    // will be sometimes negative, indicating less items than page size,
    this.numberOfItemsToDisplay = config.PAGE_SIZE + numberOfRemainingItems;
    // this page is full & there're more pages to come.
    // this page is full & it's the last page
    // this page has 3~2 less items than page size.
    if (this.numberOfItemsToDisplay > config.PAGE_SIZE) {
      this.isLastPage = false;
      this.numberOfItemsToDisplay = config.PAGE_SIZE;
    }
  }

  // `full page` means it has number of items equal to the page size
  format(_productsList) {
    let productsList = this.productsList || _productsList;
    let output = null;
    if (this.numberOfItemsToDisplay === 0) {
      output = this.createEmptyListMessage();
    } else {
      output = this.createGenericTemplate(productsList);
      // output = [{text: "SOMETHING TERRIBLY WRONG HAPPENED! PLEASE REPORT TO THE DEVELOPER"}];
      // debugger
    }
    if (this.numberOfItemsToDisplay !== 0) {
      output.push(this.createPromotionalItem());
    }
    return output;
  }

  productTemplate(product) {
    let localesManager = this.localesManager,
      locale = this.localesManager.getLocale(),
      formatter = localesManager.numberFormatter,
      productName = product.name,
      url = `https://www.example.com/${locale}/${product.urlKey}.html?source=bibo&platform=messenger`,
      image = 'https://www.example.com/media/catalog/product/cache/1/image/265x265/beff4985b56e3afdbeabfc89641a4582' + product.smallImage + '?source=bibo&platform=messenger';
      // price = `${formatter.format(product.price)}`;
    // let installments = product.getPossibleInstallments().map(installmentObj => `${formatter.format(installmentObj.installment)}/${formatter.format(installmentObj.installmentOption)} ${localesManager.buttons.months}`);

    return {
      "title": productName,
      "image_url": image,
      // "subtitle": `${localesManager.buttons.cash}: ${price}, ${localesManager.buttons.miniCash}: ${installments.join(', ')}`,
      "default_action": {
        "type": "web_url",
        "url": url,
        "webview_height_ratio": "tall",
      },
      "buttons": [
        {
          "title": price,
          "type": "web_url",
          "url": url,
          "webview_height_ratio": "tall",
        }
      ]
    };
  }

  getListButton(isLastPage) {
    if (isLastPage) {
      return {
        "title": this.contentTitles.checkWebsite,
        "type": "web_url",
        "url": `https://www.example.com/${this.localesManager.getLocale()}/?source=bibo&platform=messenger`,
        "webview_height_ratio": "tall",
      }
    } else {
      return {
        "title": this.viewMoreButton.title,
        "type": "postback",
        "payload": JSON.stringify(this.viewMoreButton.payload)
      };
    }
  }

  getQuickReplyViewMoreButton(isLastPage) {
    if (isLastPage) {
      return null;
    } else {
      return {
        "title": this.viewMoreButton.title,
        "content_type": "text",
        "payload": JSON.stringify(this.viewMoreButton.payload)
      };
    }
  }

  createListTemplate(productsList, isLastPage) {
    let button = this.getListButton(isLastPage);
    let productsTemplates = productsList.map(product => this.productTemplate(product));
    let title = this.isFirstPage ? this.contentTitles.firstPageTitle : this.contentTitles.morePagesTitle;
    return [
      {text: title},
      {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "list",
            "top_element_style": "compact",
            "elements": productsTemplates,
            "buttons": [button]
          }
        }
      }
    ];
  }

  createGenericTemplateProductButtons(productMagentoId, url) {
    return [
      {
        "type": "web_url",
        "url": url,
        "title": this.localesManager.buttons.checkWebsite
      }, {
        "type": "postback",
        "title": this.localesManager.buttons.showPrices,
        "payload": JSON.stringify({
          text:"Show Prices",
          product: {
            magentoId: productMagentoId,
          },
          key: 'showPrices',
        })
      },
    ];
  }

  createGenericTemplateProduct(product) {
    if(!product.price) {
    }
    let locale = this.localesManager.getLocale(),
      localesManager = this.localesManager,
      productName = product.name,
      formatter = this.localesManager.numberFormatter,
      url = `https://www.example.com/${locale}/${product.urlKey}.html?source=bibo&platform=messenger`,
      image = 'https://www.example.com/media/catalog/product/cache/1/image/265x265/beff4985b56e3afdbeabfc89641a4582' + product.smallImage + '?source=bibo&platform=messenger';
      // price = `${formatter.format(product.price)}`;
    // let installments = product.getPossibleInstallments().map(installmentObj => `${formatter.format(installmentObj.installment)}/${formatter.format(installmentObj.installmentOption)} ${localesManager.buttons.months}`);
    return {
      "title": productName,
      "image_url": image,
      // "subtitle": `${localesManager.buttons.cash}: ${price}, ${localesManager.buttons.miniCash}: ${installments.join(', ')}`,
      "default_action": {
        "type": "web_url",
        "url": url,
        "webview_height_ratio": "tall",
      },
      "buttons": this.createGenericTemplateProductButtons(product.magentoId, url)
    };
  }

  createPromotionalItem() {
    let quickReplies = this.promotionalItemQuickReplies.map(quickReply => {
        return {
          "content_type": "text",
          "title": quickReply.title,
          "payload": JSON.stringify(quickReply.payload),
        }
      });
      let temp = this.getQuickReplyViewMoreButton(this.isLastPage);
      temp && quickReplies.push(temp);
    return {
      text: this.contentTitles.promotionalItemTitle,
      "quick_replies": quickReplies,
    };
  }


  _createGenericTemplate(productsList) {
    let elements = productsList.map(product => this.createGenericTemplateProduct(product));
    return {
      "attachment": {
        "type": "template",
        "payload": {
          "image_aspect_ratio": "square",
          "template_type": "generic",
          "elements": elements
        }
      }
    }
  }

  createGenericTemplate(productsList) {
    let title = this.isFirstPage ? this.contentTitles.firstPageTitle
    : this.isLastPage? this.contentTitles.lastPageTitle
    : this.contentTitles.morePagesTitle;
    return [
      {text: title},
      this._createGenericTemplate(productsList)
    ];
  }

  createEmptyListMessage() {
    return [
      {
        text: this.contentTitles.emptyListTitle,
        "quick_replies": this.promotionalItemQuickReplies.map(quickReply => {
          return {
            "content_type": "text",
            "title": quickReply.title,
            "payload": JSON.stringify(quickReply.payload),
          }
        })
      },
    ];
  }

  formatProductsPrices(_productsList) {
    let self = this;
    let productsList = _productsList || self.productsList;
    return productsList.map(product => self.formatProductPrices(product));
  }

  formatProductPrices(product) {
    let message = null;
    if (this.localesManager.getLocale() === 'en') {
      message = this.formatProductPricesEN(product);
    } else if (this.localesManager.getLocale() === 'ar') {
      message = this.formatProductPricesAR(product);
    } else {
      message = {
        text: "Something Terribly Wrong happened! Please, report to the developer"
      }
    }
    return message;
  }
  formatProductPricesEN(product) {
    let self = this;
    let price = product.price,
    formatter = this.localesManager.numberFormatter,
    installments = product.getPossibleInstallments().map(({installment, installmentOption}) => {
     return `${self.localesManager.installments[installmentOption]} ${self.localesManager.misc.sideArrow} ${formatter.format(installment)} ${self.localesManager.units.currency}`
    });
    let cashPrice = `${self.localesManager.buttons.cash} ${self.localesManager.misc.sideArrow} ${formatter.format(price)}  ${self.localesManager.units.currency}`;
    let messages = [cashPrice].concat(installments);
    return {text: messages.join('\n')};

  }
  formatProductPricesAR(product) {
    return this.formatProductPricesEN(product);
  }
}

module.exports = ProductsFbFormatter;

// this method calculates the remaining number of items given the base index of pagination, totalCount, and the current page number
function getNumberOfRemainingItems(basePageNumber, totalCount, currentPageNumber) {
  return totalCount - ((currentPageNumber + ( 1 - basePageNumber )) * config.PAGE_SIZE);
}

let categoryMainFeatureFormatters = {
  "mobiles": function(category){

  },
  "tv-home-theater": function(category){

  },
  "dishwashers": function(category){

  },
  "washing-machines": function(category){

  },
  "refrigerators": function(category){

  },
  "cooker": function(category){

  },
  "microwaves": function(category){

  },
  "kettles": function(category){

  },
  "coffee-machines": function(category){

  },
  "sandwich-waffle-makers-grills": function(category){

  },
  "shaving-trimming": function(category){

  },
  "hair-dryers": function(category){

  },
  "hair-stylers": function(category){

  },
  "vacuum-cleaners": function(category){

  },
  "irons": function(category){

  },
  "food-preparation": function(category){

  },
  "electric-fans": function(category){

  },
  "laptops": function(category){

  },
  "juice-extractors-citrus-presses": function(category){

  },
  "water-filters": function(category){

  },
  "personal-care": function(category){

  },
  "kitchen-machines": function(category){

  },
  "daily-deals": function(category){

  },
}