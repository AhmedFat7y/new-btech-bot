module.exports = class SearchCriteriaBuilder {
  static build(filters, callback) {
    let category = filters.currentCategory,
      brand = filters.brand || {},
      pricing = filters.pricing || {},
      mainFeature = filters.mainFeature || {},
      filterGroups = [
        {
          filters: [
            {
              field: "status",
              condition_type: "eq",
              value: "1"
            }
          ]
        }
      ];
    SearchCriteriaBuilder.buildPricingFilter(filterGroups, pricing);
    SearchCriteriaBuilder.buildBrandFilter(filterGroups, brand);
    SearchCriteriaBuilder.buildMainFeatureFilter(filterGroups, mainFeature);

    let searchCriteria = {
      "fields": true,
      "searchCriteria": {
        "filterGroups": filterGroups,
        "currentPage": 1,
        "pageSize": 4
      }
    };
    callback(null, searchCriteria);
  }

  static calculateInstallment(itemPrice, downPayment, interestRate, numberOfMonths) {
    interestRate = interestRate * numberOfMonths / 100;
    let priceAndInterestRate = 1 + interestRate;
    return Math.ceil((itemPrice * priceAndInterestRate - downPayment * priceAndInterestRate) / numberOfMonths);
  }

  static calculatePrice(installment, downPayment, interestRate, numberOfMonths) {
    interestRate = interestRate * numberOfMonths / 100;
    let priceAndInterestRate = 1 + interestRate;
    return Math.ceil((installment * numberOfMonths + downPayment * priceAndInterestRate) / priceAndInterestRate);
  }

  static buildPricingFilter(filterGroups, pricing) {
    if (!pricing.cash && !pricing.installment) {
      return;
    }
    let numberOfMonths = 12;
    let interestRate = 2;
    let total = pricing.cash;
    if (!total) {
      total = SearchCriteriaBuilder.calculatePrice(pricing.installment, pricing.downPayment || 0, interestRate, numberOfMonths)
    }
    filterGroups.push({
      filters: [
        {
          "field": "price",
          "value": total - 500,
          "condition_type": "gt"
        }
      ]
    });
    filterGroups.push({
      filters: [
        {
          "field": "price",
          "value": total + 500,
          "condition_type": "lt"
        }
      ]
    });
  }

  static buildBrandFilter(filterGroups, brand) {
    if (!brand.id) {
      return;
    }
    filterGroups.push({
      filters: [
        {
          "field": "gfk_brand_16299",
          "value": brand.id,
          "condition_type": "eq"
        }
      ]
    });
  }

  static buildMainFeatureFilter(searchCriteria, mainFeature) {
    return;
  }
}
;