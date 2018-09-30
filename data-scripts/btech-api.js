const accessToken = require('../config').MAGENTO_AUTHENTICATION.ACCESS_TOKEN;
const request = require('request');
module.exports = class BTechAPIs {
  constructor(locale = 'en') {
    this.apis = request.defaults({
      baseUrl: `https://www.example.com/rest/${locale}/V1/`,
      qs: {
        searchCriteria: ''
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }
  _request(options) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.apis(options, (err, res, body) => {
        if (body && (body.constructor.name === 'String')) {
          try {
            body = JSON.parse(body);
          } catch (e) {
            console.error('Parse Error!', body);
            body = [];
          }
        }
        if (err || body.error || body.message) {
          console.error('Error fetching', options, err);
          err = err || body.error || body.message || 'Error Occured :(';
          reject(err);
        } else {
          resolve(body);
        }
      });
    });
  }
  _getAttributeOptions(attributeCode) {
    return this._request({
      method: 'GET',
      url: `products/attributes/${encodeURIComponent(attributeCode)}/`,
    }).then(body => body.options);
  }
  
  getAllBrands() {
    return this._getAttributeOptions('gfk_brand_16299');
  }
  getAllLabels() {
    return this._getAttributeOptions('minicash_installment_labels');
  }
  getAllBadges() {
    return this._getAttributeOptions('btech_badges');
  }
  getAllCategories() {
    return this._request({
      method: 'GET',
      url: `categories/`,
    });
  }
  getAllAttributes() {
    return this._request({
      method: 'GET',
      url: `products/attributes/?searchCriteria`,
    });
  }
  getCategoryProducts(category) {
    return this._request({
      method: 'GET',
      url: `categories/${category.magentoId}/products`,
    });
  }
  getProductDetails(sku) {
    return this._request({
      method: 'GET',
      url: `products/${encodeURIComponent(sku)}`
    });
  }
}