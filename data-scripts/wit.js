'use strict';
const request = require('request');
// const async = require('async');
// require('request-debug')(request);

const {Category} = require('../db/models/category');
const {Product} = require('../db/models/product');

const {locales} = require('./utilities');

const witKeys = {
  ar: 'KEY',
  en: 'KEY',
};

function witRequest (locale, method, path, body) {
  return new Promise((resolve, reject) => {
    request({
      url: `https://api.wit.ai${path}`,
      method,
      body,
      headers: {
        Authorization: `Bearer ${witKeys[locale]}`
      },
      json: true
    }, (err, res, body) => {
      // console.log(err || body);
      err = err || (body && body.error);
      if (err) {
        // console.error('HTTP Request error!', err);
        return reject(err);
      }
      resolve(body);
    });
  });
}

function checkIfEntityExists(locale, entityName) {
  return witRequest(locale, 'GET', `/entities/${encodeURIComponent(entityName)}`)
  .then(data => {
    console.log('Entity: ', entityName, JSON.stringify(data));
    return data;
  })
  .catch(()  => {
    return null;
  });
}


function createEntity(locale, id, values, doc, lookups) {
  // request.debug = true;
  // console.log(values);
  
  return witRequest(locale, 'POST', `/entities`, {
    id,
    values,
    doc,
    lookups: lookups || ['keywords'],
  });
}

function updateEntity(locale, entityName, values) {
  return witRequest(locale, 'PUT', `/entities/${encodeURIComponent(entityName)}`, {
    values,
  });
}

function ensureEntityExists(locale, entityName, values, description) {
  return checkIfEntityExists(locale, entityName)
    .then(entity => {
      if (entity) {
        console.log('Update Entity', entityName, locale);
        return updateEntity(locale, entityName, values);
      } else {
        console.log('Create Entity', entityName, locale);
        return createEntity(locale, entityName, values, description);
      }
    });
}

function saveCategories(locale) {
  let entityName = 'categories';
  let description = 'Categories extracted from btech magento website';
  return Category[locale].find({})
    .then(categories => categories.map(category => ({
      value: category.normalizedName,
      expressions: [category.name],
      metadata: JSON.stringify({magentoId: category.magentoId}), 
    })))
    .then(namesList => ensureEntityExists(locale, entityName, namesList, description));
}

function saveBrands(locale) {
  let entityName = 'Brand_name';
  let description = 'brands extracted from btech magento website';
  return Category[locale].find({})
    .then(categories => categories.map(category => category.brands))
    .then(brandsLists => brandsLists.reduce((acc, item) => acc.concat(item), []))
    .then(brands => brands.filter(brand => !!brand && !!brand.name))
    .then(brands => brands.map(brand => ({
      value: brand.name,
      expressions: [brand.name],
      metadata: JSON.stringify({magentoId: brand.magentoId}), 
    })))
    .then(namesList => ensureEntityExists(locale, entityName, namesList, description));
}

function saveProducts(locale) {
  let entityName = 'products';
  let description = 'products extracted from btech magento website';
  return Product[locale].find({})
    .then(products => products.filter(product => !!product.name))
    .then(products => products.map(product => ({
      value: product.name,
      expressions: [product.name],
      metadata: JSON.stringify({magentoId: product.magentoId}), 
    })))
    .then(namesList => ensureEntityExists(locale, entityName, namesList, description));
}
let promises = [];
for (let locale of locales) {
  promises.push(Promise.all([
    saveCategories(locale),
    saveBrands(locale),
    // saveProducts(locale),
  ]));
}

Promise.all(promises).then(() => process.exit(0)).catch(err => {
  console.error('Error!', err);
  process.exit(1);
});
