const path = require('path');
const PromisePool = require('es6-promise-pool');
const config = require('../config');
const utils = require('./utilities');
const LocalesManager = require('../bot/locales');

const _allMinicashLabels = {
  'en': require('./resources-new/singleton-data/all-labels'),
  'ar': require('./resources-new/singleton-data/all-labels'),
};
const _allBtechBadges = {
  'en': require('./resources-new/singleton-data/all-badges'),
  'ar': require('./resources-new/singleton-data/all-badges'),
};
const _allBrands = {
  'en': require('./resources-new/en/raw-data/all-brands'),
  'ar': require('./resources-new/ar/raw-data/all-brands'),
}
let allMinicashLabels = convertLocalesListsOfObjToObjs(_allMinicashLabels);
let allBtechBadges = convertLocalesListsOfObjToObjs(_allBtechBadges);
let allBrands = convertLocalesListsOfObjToObjs(_allBrands);

function convertLocalesListsOfObjToObjs(localeListsOfObj) {
  let result = {}
  Object.keys(localeListsOfObj)
    .forEach(locale => {
      result[locale] = {};
      localeListsOfObj[locale].forEach(obj => result[locale][obj.value] = obj.label);
    });
  return result;
}

const { Category } = require('../db/models/category');
const { Product } = require('../db/models/product');
const { KVStore } = require('../db/models/kv-store');
let _temp = require('./resources/simple-categories.json');
let neededCategories = [];

utils.flattenCategories(_temp, neededCategories);
let neededCategoriesIds = neededCategories.map(category => category.magentoId);
let neededCategoriesMap = {};
neededCategories.forEach(category => {
  category.normalizedName = utils.normalize(category.name);
  neededCategoriesMap[category.magentoId] = category;
});

let basePath = path.resolve(__dirname, 'resources-new/');

function getBasePathRawLocale(locale) {
  return path.resolve(basePath, locale, 'raw-data');
}

function getBasePathProcessedLocale(locale) {
  return path.resolve(basePath, locale, 'processed-data');
}

function flattenCategories(rootCategoryObject) {
  let flattenedCategories = [];
  utils.flattenCategories([rootCategoryObject], flattenedCategories)
  return flattenedCategories;
}

function transformCategories(locale) {
  let localesManager = new LocalesManager(locale);
  let inFileName = path.resolve(getBasePathRawLocale(locale), 'all-categories.json');
  let outFileName = path.resolve(getBasePathProcessedLocale(locale), 'simple-categories.json');
  let allAttributesFileName = path.resolve(getBasePathRawLocale(locale), 'all-attributes.json');
  let allAttributes = {};
  return Promise.all([utils.readJSON(inFileName), utils.readJSON(allAttributesFileName)])
    .then(([rootCategoryObject, allAttributesObj]) => {

      allAttributesObj.items.forEach(attribute => {
        allAttributes[attribute.attribute_code] = {
          options: attribute.options,
        };
      });
      return rootCategoryObject
    }).then(rootCategoryObject => flattenCategories(rootCategoryObject))
    .then(allcategories => allcategories
      .filter(category => neededCategoriesIds.includes(category.id))
      .map(category => {
        let {
          main_feature, main_feature_text,
          has_children, parent_magento_id,
          normalizedName, unit
        } = neededCategoriesMap[category.id];
        let options = null;
        if (main_feature && main_feature.constructor.name === 'String') {
          main_feature = [main_feature];
        } else if (!main_feature) {
          main_feature = [];
        }
        let temp = main_feature
          .filter(feature => !!feature)
          .map(feature => (allAttributes[feature] || {}).options)
          .reduce((acc, _options) => (_options && acc.concat(_options)) || acc, []);
        options = temp.length > 0 ? temp : null;
        let mainFeatureText = localesManager.categories.mainFeatureTexts[normalizedName];
        mainFeatureText = mainFeatureText || category.main_feature_text;
        return {
          name: category.name,
          normalizedName: normalizedName,
          magentoId: category.id,
          mainFeatureKeys: main_feature,
          mainFeatureText,
          options: options,
          hasChildren: has_children,
          parentMagentoId: parent_magento_id,
          unit: unit || null,
        };
      })
    )
    .then(categories => utils.writeJSON(outFileName, categories));
}

function prepareCategoriesForMongo(categories) {
  return categories.map(category => {
    let mainFeatureKeys = category.mainFeatureKeys || '';
    if (mainFeatureKeys.constructor.name === 'String') {
      mainFeatureKeys = [mainFeatureKeys];
    }
    return {
      magentoId: category.magentoId,
      name: category.name,
      normalizedName: category.normalizedName,
      options: category.options && category.options.filter(option => !!option.label && !!option.value),
      mainFeatureText: category.mainFeatureText,
      mainFeatureKeys,
      brands: null,
      hasChildren: category.hasChildren || false,
      parentMagentoId: category.parentMagentoId || 0,
      unit: category.unit || null,
    }
  });
}

function* _saveOrUpdateCategoriesHelper(locale, categoriesList) {
  for (let category of categoriesList) {
    yield Category[locale].create(category);
  }
}

function saveOrUpdateCategories(locale, categoriesList) {
  let generator = _saveOrUpdateCategoriesHelper(locale, categoriesList);
  let pool = new PromisePool(generator, 5);
  return Category[locale].remove({})
    .then(result => pool.start()
      .then(() => {
        // console.log('Saved/Updated Categories');
      })
      .catch(err => {
        if (err.code !== 11000) {
          console.error('ERROR HAPPENED while saving or updating :(', err);
        }
      })
    );
}

function* _saveOrUpdateProducts(locale, productsList) {
  for (let product of productsList) {
    yield Product[locale].create(product);
  }
}

function saveOrUpdateProducts(locale, productsList) {
  let generator = _saveOrUpdateProducts(locale, productsList);
  let pool = new PromisePool(generator, 5)
  return pool.start()
    .then(() => {
      // console.log('Saved/Updated Products');
    })
    .catch(err => {
      if (err.code !== 11000) {
        console.error('ERROR HAPPENED while saving or updating :(', err);
      }
    });
}

function commaSeparatedToList(commaSeparatedStr) {
  return (commaSeparatedStr && commaSeparatedStr.split(',')) || [];
}

function extractMainFeatureValue(category, product, locale) {
  let mainFeatureValueRaw = null, mainFeatureValueParsed = null;
  let validKey = (category.mainFeatureKeys || [])
    .filter(mainFeatureKey => !!product.customAttributes[mainFeatureKey]);
  validKey = (validKey.length && validKey[0]) || null;
  if (validKey) {
    mainFeatureValueRaw = product.customAttributes[validKey];
    mainFeatureValueParsed = parseInt(product.customAttributes[validKey]);
  }
  return { mainFeatureValueRaw, mainFeatureValueParsed };
}

function extractBtechBadges(category, product, locale) {
  let btechBadges = commaSeparatedToList(product.customAttributes.btech_badges);
  return btechBadges.map(id => ({ magentoId: id, text: allBtechBadges[id] }));
}

function extractInstallmentsNoInterest(category, product, locale) {
  let installmentsNoInterest = commaSeparatedToList(product.customAttributes.installments_no_interest);
  return installmentsNoInterest;
}

function extractMiniCashLabels(category, product, locale) {
  let minicashLabels = commaSeparatedToList(product.customAttributes.minicash_installment_labels);
  return minicashLabels.map(id => ({ magentoId: id, text: allMinicashLabels[id] }));
}

function transformProduct(category, product, locale) {
  let customAttributes = {};
  product.custom_attributes.forEach(({ attribute_code, value }) => customAttributes[attribute_code] = value);
  product.customAttributes = customAttributes;
  let installmentsNumber = commaSeparatedToList(customAttributes.installments_number);
  let installmentsNoInterest = extractInstallmentsNoInterest(category, product, locale);
  let minicashLabels = extractMiniCashLabels(category, product, locale);
  let btechBadges = extractBtechBadges(category, product, locale);
  let mainFeatureValueRaw = null, mainFeatureValueParsed = null;
  if (category.mainFeatureKeys && category.mainFeatureKeys.length) {
    ({ mainFeatureValueRaw, mainFeatureValueParsed } = extractMainFeatureValue(category, product, locale));
  }
  let brand = {
    name: allBrands[locale][customAttributes.gfk_brand_16299],
    magentoId: customAttributes.gfk_brand_16299,
  }
  let hasOffer = false;
  if (installmentsNoInterest.length || customAttributes.special_price, minicashLabels.length) {
    hasOffer = true;
  }
  return {
    magentoId: product.id,
    sku: product.sku,
    name: product.name,
    price: product.price,
    status: product.status,
    visibility: product.visibility,
    brand,
    metaTitle: customAttributes.meta_title,
    metaDescription: customAttributes.meta_description,
    shortDescription: customAttributes.gfk_short_description_40051,
    smallImage: customAttributes.small_image,
    urlKey: customAttributes.url_key,
    isInstallmentsAllowed: customAttributes.installments_allow,
    interestRate: customAttributes.interest_rate,
    specialPrice: customAttributes.special_price,
    installmentsNoInterest: installmentsNoInterest,
    minicashLabels,
    btechBadges,
    installmentOptions: installmentsNumber,
    category: {
      name: category.name,
      magentoId: category.magentoId,
      normalizedName: category.normalizedName,
    },
    mainFeature: {
      rawValue: mainFeatureValueRaw,
      parsedValue: mainFeatureValueParsed,
    },
    hasOffer,
  };
}

//function used to calculateInstallments of prices
function calculateInstallment(itemPrice, downPayment, interestRate, numberOfMonths) {
  interestRate = interestRate * numberOfMonths / 100;
  let priceAndInterestRate = 1 + interestRate;
  return Math.ceil((itemPrice * priceAndInterestRate - downPayment * priceAndInterestRate) / numberOfMonths);
}

function* transformProductsLists(locale, categories) {
  for (let category of categories) {
    if (category.hasChildren) {
      continue;
    }
    let inputFile = path.resolve(getBasePathRawLocale(locale), `products-lists/${category.normalizedName}__products-list.json`);
    let outFile = path.resolve(getBasePathProcessedLocale(locale), `products-lists/${category.normalizedName}__products-list.json`);
    yield utils.readJSON(inputFile)
      .then(productsList => productsList.map(product => transformProduct(category, product, locale)))
      .then(transformedProductsList => utils.writeJSON(outFile, transformedProductsList));
  }
  yield Promise.resolve([]);
}

function prepareProductsListsForProcessing(locale) {
  let categoriesFileName = path.resolve(getBasePathProcessedLocale(locale), 'simple-categories.json');
  return utils.readJSON(categoriesFileName)
    .then(categories => {
      let generator = transformProductsLists(locale, categories);
      let pool = new PromisePool(generator, 3);
      return pool.start();
    });
}

function* processCategories() {
  for (let locale of utils.locales) {
    let categoriesFileName = path.resolve(getBasePathProcessedLocale(locale), 'simple-categories.json');
    yield transformCategories(locale);
  }
}

function* saveCategories() {
  for (let locale of utils.locales) {
    let fileName = path.resolve(getBasePathProcessedLocale(locale), 'simple-categories.json');
    yield utils.readJSON(fileName)
      .then(prepareCategoriesForMongo)
      .then(data => saveOrUpdateCategories(locale, data))
      .then(res => console.log('Saved Data'));
  }
}

function* processProducts() {
  for (let locale of utils.locales) {
    yield prepareProductsListsForProcessing(locale);
  }
}
function* dropProducts() {
  for (let locale of utils.locales) {
    yield Product[locale].remove({})
      .then(data => {
        console.log('Removed Products before inserting');
        return data;
      });
  }
}
function* saveProducts() {
  for (let locale of utils.locales) {
    for (let category of neededCategories) {
      if (category.has_children) {
        continue;
      }
      let fileName = path.resolve(getBasePathProcessedLocale(locale), `products-lists/${category.normalizedName}__products-list.json`);
      yield utils.readJSON(fileName)
        .then(data => saveOrUpdateProducts(locale, data))
        .then(res => console.log('Saved Data', category.normalizedName));
    }
  }
}

function extractUniqueValues(locale) {
  return Product[locale].aggregate({
    $group: {
      _id: '$category.magentoId',
      uniqueValues: {
        $addToSet: '$mainFeature.parsedValue'
      },
      brands: {
        $addToSet: '$brand'
      },
      uniquePrices: {
        $addToSet: '$price'
      },
      hasOffer: {
        $addToSet: '$hasOffer'
      }
    }
  });
}

function updateCategory(magentoId, updateDocument, locale) {
  return Category[locale].update({ magentoId }, updateDocument);
}

function reformat(category, uniqueValues, isCash) {
  if (category.magentoId === 48 && !isCash) {
    uniqueValues = uniqueValues.filter(val => !!val && val >= 512)
      .map(val => val / 1024);
  }
  return uniqueValues;
}

// Function formates an array of uniqueValues into ranges
function formatNumberRanges(category, localesManager, uniqueValues, nOptions,isCash) {
  if (category.normalizedName === 'mobiles') {
  }
  let min = uniqueValues[0],
    max = uniqueValues[uniqueValues.length - 1];
  let range = parseFloat(((max - min) / nOptions).toFixed(1));
  console.log("range"+range);
  let options = [];
  let label = '';
  for (let i = 0; i < nOptions; i++) {
    max = min + range;
    if(!isCash){
      let unit = getCategoryLocalizedUnit(category, localesManager, max);
      label = `${localesManager.formatNumber(min)} - ${localesManager.formatNumber(max)} ${unit}`;
      options.push({
        label,
        "value": [min, max],
      });
    }
    else{
      //let unit = getCategoryLocalizedUnit(category, localesManager, max);
      label = `${localesManager.formatNumber(min)} - ${localesManager.formatNumber(max)}`;
      options.push({
        label,
        "value": [min, max],
      });
    }
  console.log(min+" dasdsa "+max);
    min += range;
  }
  return options;
}

function getCategoryLocalizedUnit(category, localesManager, val) {
  let localeUnit = localesManager.units[category.unit];
  if (typeof localeUnit === 'function') {
    localeUnit = localeUnit(val);
  }
  return localeUnit;
}

//function that formats a single number with a label and value
function formatSingleNumbers(category, localesManager, uniqueValues, nOptions,isCash) {
  let options = [];
  for (let value of uniqueValues) {
    let unit = getCategoryLocalizedUnit(category, localesManager, value);
    let label = '';
  //  if (localesManager.isRTL() && false) {
      // label = `${unit} ${localesManager.formatNumber(value)}`;
  //  } else
    if (!isCash) {
        label = `${localesManager.formatNumber(value)} ${unit}`;
        options.push({
          label,
          value,
        });
    }else{
      label = `${localesManager.formatNumber(value)} `;
        options.push({
          label,
          value,
        });
    }

  }
  return options;
}

function generateCategoryOptions(category, uniqueValues, locale, isCash) {
  let localesManager = new LocalesManager(locale);
  let nOptions = 7;
  let options = [];
  uniqueValues = reformat(category, uniqueValues, isCash);
  if (uniqueValues.length > nOptions) {
    options = formatNumberRanges(category, localesManager, uniqueValues, nOptions,isCash);
  } else {
    options = formatSingleNumbers(category, localesManager, uniqueValues, nOptions,isCash);
  }
  return options;
}

function markSupportedBrands(brands) {
  let suppotedBrandsNames = utils.supportedBrands.map(utils.normalize);
  let semiSuppotedBrandsNames = utils.semiSupportedBrands.map(utils.normalize)
  for (let brand of brands) {
    let normalizedBrandName = utils.normalize(brand.name);
    if (suppotedBrandsNames.includes(normalizedBrandName)) {
      brand.supported = true;
    } else if (semiSuppotedBrandsNames.includes(normalizedBrandName)) {
      brand.semiSupported = true;
    }
  }
}
// function that updates each Category with the aggregated results
function* _updateCategoriesWithAggregationResults(aggregationResults, locale) {
  for (let obj of aggregationResults) {
    let { _id, brands, uniqueValues, uniquePrices, hasOffer} = obj;
    hasOffer = hasOffer.some(val => val);
    brands = brands
      .filter(brandId => !!brandId)
    uniqueValues = uniqueValues
      .filter(val => !!val)
      .sort((a, b) => a - b);
    uniquePrices = uniquePrices
      .filter(val => !!val)
      .sort((a, b) => a - b);
  let uniqueInstallments = uniquePrices.map(element => {
      return calculateInstallment(element, 0, 2, 12);
    })

    markSupportedBrands(brands);
    yield Category[locale].findOne({ magentoId: _id })
      .then(category => {
        let options;
        let cashOptions;
        let minicashOptions;
        if (category.unit) {
          options = generateCategoryOptions(category, uniqueValues, locale,false);
        } else {
          options = category.options || [];
        }
      // generate ranges for the cash and installments/minicash
        cashOptions = generateCategoryOptions(category, uniquePrices, locale,true);
        minicashOptions = generateCategoryOptions(category, uniqueInstallments, locale,true);
        return [options, cashOptions,minicashOptions];
      })
      .then(([options,cashOptions,minicashOptions]) => updateCategory(_id, { brands, uniqueValues, options, uniquePrices, uniqueInstallments, cashOptions, minicashOptions, hasOffer }, locale));
  }
}

function updateCategoriesWithAggregationResults(aggregationResults, locale) {
  let generator = _updateCategoriesWithAggregationResults(...arguments);
  let pool = new PromisePool(generator, 3);
  return pool.start()
}

function convertCategoriesListToTree(categories) {
  let tree = {};
  let categoriesObj = {};
  categories.forEach(category => {
    categoriesObj[category.magentoId] = category;
  });
  for (let category of categories) {
    if (!category.parentMagentoId) {
      tree[category.magentoId] = category;
    } else {
      let parentCategory = categoriesObj[category.parentMagentoId];
      parentCategory.children = parentCategory.children || {};
      parentCategory.children[category.magentoId] = category;
    }
  }
  return tree;
}

function saveCategoriesTree(locale, categoriesTree) {
  return KVStore[locale].update({
    key: 'categories-tree', locale: locale
  }, {
      key: 'categories-tree',
      value: categoriesTree,
      locale,
    }, {
      upsert: true
    });
}

function* aggregateCategoryProducts() {
  for (let locale of utils.locales) {
    yield extractUniqueValues(locale)
      .then(data => updateCategoriesWithAggregationResults(data, locale))
  }
  for (let locale of utils.locales) {
    yield Category[locale]
      .find({}, ['magentoId', 'name', 'parentMagentoId'])
      .lean()
      .then(convertCategoriesListToTree)
      .then(saveCategoriesTree.bind(null, locale))
  }
}
function* markSupportedCategory1(categories) {
  let suppotedBrandsNames = utils.supportedBrands.map(utils.normalize);
  let semiSuppotedBrandsNames = utils.semiSupportedBrands.map(utils.normalize)
  for (let category of categories) {
    let brands = (category.brands || []).map(brand => utils.normalize(brand.name));
    let supported = brands.some(b => suppotedBrandsNames.includes(b));
    // supported |= brands.some(b => semiSuppotedBrandsNames.includes(b));
    if (supported && category.normalizedName !== 'daily-deals') {
      category.supported = true;
      console.log('Supported: ', category.normalizedName);
      yield category.save();
    }
  }
}
function _markSupportedCategory2Helper(supportedCategory, categoryEN) {
  supportedCategory.supported = true;
  let supportedCategoryBrands = (supportedCategory.brands) || [];
  for (let brandEN of (categoryEN.brands || [])) {
    if (brandEN.supported) {
      let supportedBrand = supportedCategoryBrands.find(brand => brand.magentoId === brandEN.magentoId);
      supportedBrand.supported = true;
    }
  }
  // return supportedCategory.save();
}
function* markSupportedCategory2(categories, categoriesEN) {
  for (let categoryEN of categoriesEN) {
    if (categoryEN.supported) {
      let supportedCategory = categories.find(category => category.magentoId === categoryEN.magentoId);
      _markSupportedCategory2Helper(supportedCategory, categoryEN);
      yield supportedCategory.save();
    }
  }
}
// Category.en.find({}, { _id: 0, magentoId: 1, supported: 1, brands: 1 }).lean().exec()
function _markSupportedBrandsCategoriesHelper(locale) {
  if (locale === 'en') {
    return Category[locale].find({})
      .then(categories => {
        let generator = markSupportedCategory1(categories)
        let pool = new PromisePool(generator, 1);
        return pool.start();
      });
  } else {
    return Promise.all([
      Category[locale].find({}),
      Category.en.find({}, { _id: 0, magentoId: 1, supported: 1, brands: 1 }).lean().exec()
    ]).then(([categories, categoriesEN]) => {
      let generator = markSupportedCategory2(categories, categoriesEN);
      let pool = new PromisePool(generator, 1);
      return pool.start();
    });
  }
}
function* markSupportedBrandsCategories() {
  for (let locale of ['en', 'ar']) {
    yield _markSupportedBrandsCategoriesHelper(locale);
  }
}

let generator = utils.chainGenerators(
  { generator: processCategories(), name: 'Process Categories' },
  { generator: saveCategories(), name: 'Save Categories' },
  { generator: processProducts(), name: 'Process Products' },
  { generator: dropProducts(), name: 'Drop products' },
  { generator: saveProducts(), name: 'Save products' },
  { generator: aggregateCategoryProducts(), name: 'Aggregate Products' },
  { generator: markSupportedBrandsCategories(), name: 'Mark supported brands and categories' }
);
let pool = new PromisePool(generator, 1);
pool.start()
  .then(() => {
    console.log('DONE');
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR HAPPENED :(', err);
    process.exit(1);
  })
