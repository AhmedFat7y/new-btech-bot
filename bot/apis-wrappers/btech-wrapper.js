"use strict";
const request = require('request');
const async = require('async');
const fs = require('fs');
const path = require('path');
const SearchCriteriaBuilder = require('./search-criteria-builder');
const { MAGENTO_AUTHENTICATION } = require('../../config');

const ACCESS_TOKEN = MAGENTO_AUTHENTICATION.ACCESS_TOKEN;
const CERT_FILE = fs.readFileSync(path.resolve(__dirname, 'client.cert'));
const KEY_FILE = fs.readFileSync(path.resolve(__dirname, 'priv.key'));
// console.log('length:', CERT_FILE.length);
class BtechAPI {
  constructor() {
    // request.debug = true;
    this.accessToken = ACCESS_TOKEN;
    this.baseUrl = 'https://www.example.com/rest/V1/';
    this.apis = this.constructRequestBase();
  }

  constructRequestBase() {
    let self = this;
    return request.defaults({
      baseUrl: self.baseUrl,
      headers: {
        'Authorization': `Bearer ${self.accessToken}`
      }
    });
  }

  buildSearchCriteria(filtersObject, existingSearchCriteria, callback) {
    if (existingSearchCriteria && existingSearchCriteria.current_page) {
      existingSearchCriteria.current_page++;
      callback(null, {
        searchCriteria: existingSearchCriteria,
        fields: true
      });
    } else {
      SearchCriteriaBuilder.build(filtersObject, callback);
    }
  }

  _getProducts(searchCriteria, callback) {
    this.apis('/products/', {
      method: 'PUT',
      json: searchCriteria
    }, (err, res, body) => {
      if (err) {
        console.error('Error fetching products', err);
        callback(null, {});
      } else {

        console.log('Search Criteria:', JSON.stringify(body.search_criteria));
        callback(null, body);
      }
    })
  }

  getProducts(filtersObject, existingSearchCriteria, callback) {
    const self = this;
    async.waterfall([
      nextFunc => self.buildSearchCriteria(filtersObject, existingSearchCriteria, nextFunc),
      (searchCriteria, nextFunc) => self._getProducts(filtersObject, nextFunc),
    ], callback);
  }
  
  getInstallments(nationalId, callback) {
    request({
      method: 'GET',
      url: 'https://webservice.b-tech.com.eg/API/api/InstallmentRunning',
      qs: {
        key: 'U2FsdGVkX1OQ4oVhQeGYd3heMTCdDBtbVuiZ3ANA98=',
        SSN: nationalId,
      },
      cert: CERT_FILE,
      key: KEY_FILE,
      passphrase: 'BTECH',
    }, function (error, response, body) {
      if (error) {
        console.error('error getting installments info', error);
      }
      body = parseBody(body);
      if (!body) {
        error = { message: "the data returned is empty :(" };
      }
      callback(error, body);
    });
  }

  getCustomerDetails(nationalId, callback) {
    request({
      method: 'GET',
      url: 'https://webservice.b-tech.com.eg/API/api/Customers',
      qs: {
        key: 'U2FsdGVkX1OQ4oVhQeGYd3heMTCdDBtbVuiZ3ANA98=',
        SSN: nationalId
      },
      cert: CERT_FILE,
      key: KEY_FILE,
      passphrase: 'BTECH',
    }, function (error, response, body) {
      if (error) {
        console.error('error getting customer info', error);
      }
      body = parseBody(body);
      if (!body) {
        error = { message: "the data returned is empty :(" };
      }
      callback(error, body);
    });
  }

  getCreditLimit(nationalId, callback) {
    request({
      method: 'GET',
      url: 'https://webservice.b-tech.com.eg/API/api/CustomerCreditLimitClass',
      qs: {
        key: 'U2FsdGVkX1OQ4oVhQeGYd3heMTCdDBtbVuiZ3ANA98=',
        SSN: nationalId,
      },
      cert: CERT_FILE,
      key: KEY_FILE,
      passphrase: 'BTECH',
      // rejectUnauthorized: false,
    }, function (error, response, body) {
      if (error) {
        console.error('error getting credit limit', error);
      }
      body = parseBody(body);
      if (!body) {
        error = { message: "the data returned is empty :(" };
      }
      callback(error, body);
    });
  }


  getOrderStatus(orderId, callback) {
    this.apis(`orders/items/${orderId}`, {
      method: 'GET'
    }, (err, res, body) => {
      if (err) {
        console.error('Error fetching order details', err);
        callback(null, {});
      } else {
        console.log('Order details:', JSON.stringify(body));
        callback(null, body);
      }
    })
  }
}

let btechAPI = new BtechAPI();
module.exports = btechAPI;


function parseBody(body) {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (e) {
      console.error('Error Parsing Body in btech wrapper:', body);
      return null;
    }
  }
  return body;
}