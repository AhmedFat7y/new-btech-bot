/////////////////////////// Imports Start \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const path = require('path');
const fs = require('fs');
const PromisePool = require('es6-promise-pool');
const accessToken = require('../config').MAGENTO_AUTHENTICATION.ACCESS_TOKEN;
const _temp = require('./resources/simple-categories.json');
const BTechAPIs = require('./btech-api');
const utils = require('./utilities');
/////////////////////////// Imports End \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
/////////////////////////// Setup Starts \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
let errorHappened = false;
let categories = [];
utils.flattenCategories(_temp, categories);
categories.forEach(category => category.normalizedName = utils.normalize(category.name));

let locales = utils.locales;
let promises = [];
for (let locale of locales) {
  let btechAPIs = new BTechAPIs(locale);

  let basePath = path.resolve(__dirname, 'resources-new/');
  let basePathWithLocale = path.resolve(basePath, locale);
  let rawDataPath = path.resolve(basePathWithLocale, 'raw-data');
  let processedDataPath = path.resolve(basePathWithLocale, 'processed-data');
  let categoriesProductsPath = path.resolve(basePath, 'categories-products');
  let singletonDataPath = path.resolve(basePath, 'singleton-data');
  let rawProductsListsPath = path.resolve(rawDataPath, 'products-lists');
  let processedProductsListsPath = path.resolve(processedDataPath, 'products-lists');
  let allPaths = [basePath, basePathWithLocale, processedDataPath, rawDataPath, singletonDataPath, rawProductsListsPath, processedProductsListsPath, categoriesProductsPath];

  console.log('Creating Directories:\n\t', allPaths);
  allPaths.forEach(_path => {
    console.log('Try To Create Dirctory:\n\t', _path);
    try {
      fs.mkdirSync(_path);
    } catch (e) {
      if (e.code !== 'EEXIST') {
        console.error('Error Creating Path:', _path, e);
        process.exit(0);
      }
      console.log('\tExists');
    }
  });
  /////////////////////////// Setup End \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

  /////////////////////////// Singleton Data Start \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  // returns [{label: 'BrandName': value: 'BrandId'}]
  function getAllBrands() {
    let fileName = path.resolve(rawDataPath, 'all-brands.json');
    console.log('Getting All Brands');
    return utils.readJSON(fileName)
      .catch(err => btechAPIs.getAllBrands().then(
          allBrands => utils.writeJSON(fileName, allBrands),
          err => {
            console.error('Error Getting Brands!', err);
            throw err;
          }
        ));
  }
  function getAllCategories () {
    let fileName = path.resolve(rawDataPath, 'all-categories.json');
    console.log('Getting All Categories');
    return utils.readJSON(fileName)
      .catch(err => btechAPIs.getAllCategories().then(
          allCategories => {
            let dailyDealsCategory = categories.find(category => category.normalizedName === 'daily-deals');
            dailyDealsCategory.magentoId = allCategories.children_data[0].id;
            return utils.writeJSON(fileName, allCategories);
          },
          err => {
            console.error('Error Getting Categories!', err);
            throw err;
          }
        ));
  }
  function getAllAttributes() {
    let fileName = path.resolve(rawDataPath, 'all-attributes.json');
    console.log('Getting All Attributes');
    return utils.readJSON(fileName)
      .catch(err => btechAPIs.getAllAttributes().then(
          allAttributes => utils.writeJSON(fileName, allAttributes),
          err => {
            console.error('Error Getting Attributes!', err);
            throw err;
          }
        ));
  }
  // returns [{label: 'LabelText': value: 'LabelId'}]
  function getAllLabels() {
    let fileName = path.resolve(singletonDataPath, 'all-labels.json');
    console.log('Getting All Labels');
    return utils.readJSON(fileName)
      .catch(err => btechAPIs.getAllLabels().then(
        allLabels => utils.writeJSON(fileName, allLabels),
        err => {
          console.error('Error Getting Labels!', err);
          throw err;
        }
      ));
  }

  // returns [{label: 'BadgeText': value: 'BadgeId'}]
  function getAllBadges() {
    let fileName = path.resolve(singletonDataPath, 'all-badges.json');
    console.log('Getting All Badges');
    return utils.readJSON(fileName)
      .catch(err => btechAPIs.getAllBadges().then(
        allBadges => utils.writeJSON(fileName, allBadges),
        err => {
          console.error('Error Getting Badges!', err);
          throw err;
        }
      ));
  }
  /////////////////////////// Singleton Data End \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  /////////////////////////// Categories Data Start \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  // category: {name: 'categoryName', magentoId: 'magentoId'}
  function getCategoryProducts(category) {
    let fileName = path.resolve(categoriesProductsPath, category.normalizedName + '__products.json' );
    console.log('Getting Products List for Category:\n\t', category.normalizedName);
    return utils.readJSON(fileName)
      .catch(err => btechAPIs.getCategoryProducts(category)
        .then(
          categoryProducts => utils.writeJSON(fileName, categoryProducts),
          err => {
            console.error('Error Getting Products for Category:', category, err);
            throw err;
          }
        )
      );
  }

  function * getCategoriesProducts(categories) {
    console.log('Getting Categories Products');
    let container = {};
    for (let category of categories) {
      // depend on that assignment operation evaluates to the assigned value
      if (category.has_children) {
        continue;
      }
      yield getCategoryProducts(category)
        .then(categoryProducts => container[category.normalizedName] = categoryProducts);
    }
    yield Promise.resolve([]);
  }
  /////////////////////////// Categories Data End \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  /////////////////////////// Products Data Start \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  function * productsPromisesGenerator(categoryProducts) {
    for (let categoryProduct of categoryProducts) {
      yield btechAPIs.getProductDetails(categoryProduct.sku)
      .then(data => {
        return data;
      })
      .catch(e => {
        throw e;
      }) ;
    }
  }

  function getProductsListDetails(category, categoryProducts) {
    let productsListStore = [];
    let generator = productsPromisesGenerator(categoryProducts);
    let pool = new PromisePool(generator, 3);
    pool.addEventListener('fulfilled', function (event) {
      productsListStore.push(event.data.result);
    });
    return pool.start()
    .then(() => {
      console.log('Got products for', category.normalizedName);
      return productsListStore
    })
    .catch(err => {
        console.error('error getting products', err);
        return productsListStore;
    })
  }

  function * getCategoriesProductsDetails(categories) {
    console.log('Getting products details');
    for (let category of categories){
      if (category.has_children) {
        continue;
      }
      let productsListFileName = path.resolve(rawProductsListsPath, `${category.normalizedName}__products-list.json`);
      let categoryProductsFileName = path.resolve(categoriesProductsPath, category.normalizedName + '__products.json' )
      yield utils.readJSON(productsListFileName)
      .catch(err => {
        return utils.readJSON(categoryProductsFileName)
          .then(categoryProducts => {
            return getProductsListDetails(category, categoryProducts)
          })
          .then(productsListDetails => {
            return utils.writeJSON(productsListFileName, productsListDetails)
          })
      }).then((data) => {
        console.log(category.normalizedName);
        return data;
      });
    }
  }
  /////////////////////////// Products Data End \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  /////////////////////////// Calls Start \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  let generator = utils.chainGenerators(
    {generator: utils.chainPromises(getAllAttributes, getAllCategories, getAllBrands, getAllLabels, getAllBadges), name: 'singletonData'},
    {generator: getCategoriesProducts(categories), name: 'categoriesProducts'},
    {generator: getCategoriesProductsDetails(categories), name: 'categoriesProductsDetails'}
  );
  let pool = new PromisePool(generator, 1);
  promises.push(pool.start()
    .then(() => {
      console.log(locale, 'DONE');
    })
    .catch(err => {
      errorHappened = true;
      console.error(locale, 'ERROR HAPPENED :(', err);
    }));
  /////////////////////////// Calls End \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

}
Promise.all(promises).then(() => {
  if (errorHappened) {
    console.error('Error Happened before!')
    throw new Error();
  }
  process.exit(0);
}).catch(err => {
  console.error('Error Happened: ', err);
  process.exit(1)
});
