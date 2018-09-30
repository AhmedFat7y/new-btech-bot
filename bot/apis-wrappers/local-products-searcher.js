"use strict";
const request = require('request');
const async = require('async');
const config = require('../../config');

class LocalProductsSearcher {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.repo = stateManager.repo;
  }

  reformatProductObject(product) {
    return {
      price: this.calculateInstallment(product.price, 0, product.interestRate / 100, 12),
      name: product.name,
      description: product.shortDescription || product.metaDescription,
      urlKey: product.urlKey,
      imageKey: product.smallImage,
    }
  }


  calculateInstallment(itemPrice, downPayment, interestRate, numberOfMonths) {
    interestRate = interestRate * numberOfMonths / 100;
    let priceAndInterestRate = 1 + interestRate;
    return Math.ceil((itemPrice * priceAndInterestRate - downPayment * priceAndInterestRate) / numberOfMonths);
  }

  calculatePrice(installment, downPayment, interestRate, numberOfMonths) {
    interestRate = interestRate * numberOfMonths / 100;
    let priceAndInterestRate = 1 + interestRate;
    return Math.ceil((installment * numberOfMonths + downPayment * priceAndInterestRate) / priceAndInterestRate);
  }

  buildPricingQuery(query, pricingFilter) {
    if (!(pricingFilter.cash && pricingFilter.cash.length) && !(pricingFilter.installment && pricingFilter.installment.length)) {
      return query;
    }
    let numberOfMonths = 12;
    let interestRate = 2;
    let total = pricingFilter.cash;
    if (!total && !total.length) {
      for (let installment of pricingFilter.installment) {
        total.psuh(this.calculatePrice(installment, 0, interestRate, numberOfMonths));
      }
    }
    if(total.length === 2) {
      query = query.where('price').gte(total[0]).lte(total[1]);
    } else {
      query = query.where('price').gte(total[0] - 0.2 * total[0]).lte(total[0] + 0.2 * total[0]);
    }

    return query;
  }

  buildBrandQuery(query, brandFilter) {
    if (brandFilter.magentoId) {
      query = query.where('brand.magentoId').eq(brandFilter.magentoId);
    }
    return query;
  }

  buildMainFeatureQuery(query, mainFeatureFilter) {
    if (mainFeatureFilter.searchValues && mainFeatureFilter.searchValues.length) {
      if (mainFeatureFilter.searchValues.length === 1) {
        query = query.where('mainFeature.parsedValue').eq(mainFeatureFilter.searchValues[0]);
      } else if (mainFeatureFilter.searchValues.length === 2) {
        query = query.where('mainFeature.parsedValue').gte(mainFeatureFilter.searchValues[0]).lte(mainFeatureFilter.searchValues[1]);
      }
    }
    return query;
  }

  incrementCurrentPageNumber(filtersObject) {
    if (typeof filtersObject.currentPageNumber === 'undefined') {
      filtersObject.currentPageNumber = -1;
    }
    filtersObject.currentPageNumber++;
  }

  buildQuery(filtersObject, existingSearchCriteria, callback) {
    if (existingSearchCriteria) {
      filtersObject = existingSearchCriteria;
    }// `full page` means it has number of items equal to the page size
    // if undefined give it -1 so the next increment resets it to 0;
    this.incrementCurrentPageNumber(filtersObject);
    let query = this.repo.getProductsQueryObject()
    if (filtersObject.currentCategory && filtersObject.currentCategory.magentoId) {
      query = query.where('category.magentoId').eq(filtersObject.currentCategory.magentoId);
    }
    if (filtersObject.pricing) {
      query = this.buildPricingQuery(query, filtersObject.pricing);
    }
    if (filtersObject.brand) {
      query = this.buildBrandQuery(query, filtersObject.brand);
    }
    if (filtersObject.mainFeature) {
      query = this.buildMainFeatureQuery(query, filtersObject.mainFeature);
    }
    if (filtersObject.hasOffer) {
      query = query.where('hasOffer').eq(true);
    }
    callback(null, filtersObject, query);
  }

  buildCountAndLimitQueries(filters, query) {
    return [
      this.repo.getProductsQueryObject(query.getQuery()).count(),
      this.repo.getProductsQueryObject(query.getQuery()).limit(config.PAGE_SIZE).skip(filters.currentPageNumber * config.PAGE_SIZE),
    ]
  }

  _getProducts(filters, query, callback) {
    let [queryCount, queryProducts] = this.buildCountAndLimitQueries(filters, query);
    async.parallel([
      parallelCallback => filters.totalCount ? parallelCallback(null, filters.totalCount) : queryCount.exec(parallelCallback),
      parallelCallback => queryProducts.exec(parallelCallback)
    ], (err, [totalCount, products]) => {
      filters.totalCount = totalCount;
      callback(err, filters, products);
    });
  }

  getProducts(filtersObject, existingFilters, callback) {
    async.waterfall([
      nextFunc => this.buildQuery(filtersObject, existingFilters, nextFunc),
      (newFiltersObject, query, nextFunc) => this._getProducts(newFiltersObject, query, nextFunc),
    ],callback);
  }

  getDailyDealsProducts(filters, callback) {
    this.incrementCurrentPageNumber(filters);
    let query = this.repo.getDailyDealsProducts();
    this._getProducts(filters, query, callback);
  }
  getProduct(magentoId, callback) {
    this.repo.getProduct(magentoId).exec(callback);
  }
}
module.exports = LocalProductsSearcher;
