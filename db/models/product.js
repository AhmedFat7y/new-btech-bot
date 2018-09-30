"use strict";
let db = require('./../connector');
let mongoose = db.connect();
const TYPE_STRING_LOWERCASE = {type: String, lowercase: true, trim: true};
const TYPE_STRING = {type: String, trim: true};
const TYPE_NUMBER = {type: Number};
let ProductSchema = new mongoose.Schema({
  magentoId: Object.assign({}, TYPE_NUMBER, {index: true, unique: true}),
  sku: TYPE_STRING,
  name: TYPE_STRING,
  price: TYPE_NUMBER,
  status: TYPE_NUMBER,
  visibility: TYPE_NUMBER,
  brand: {
    name: TYPE_STRING,
    magentoId: Object.assign({}, TYPE_NUMBER, {index: true, unique: true}),
  },
  metaTitle: TYPE_STRING,
  metaDescription: TYPE_STRING,
  shortDescription: TYPE_STRING,
  smallImage: TYPE_STRING,
  urlKey: TYPE_STRING,
  isInstallmentsAllowed: {type: Boolean, default: true},
  interestRate: TYPE_NUMBER,
  specialPrice: TYPE_NUMBER,
  installmentsNoInterest: [TYPE_NUMBER],
  minicashLabels: [
    {
      text: TYPE_STRING,
      magentoId: TYPE_NUMBER,
    }
  ],
  btechBadges: [
    {
      text: TYPE_STRING,
      magentoId: TYPE_NUMBER,
    }
  ],
  installmentOptions: {
    type: [TYPE_NUMBER],
    default: [6, 12, 18, 24]
  },
  category: {
    name: TYPE_STRING,
    magentoId: Object.assign({}, TYPE_NUMBER, {index: true}),
    normalizedName: TYPE_STRING_LOWERCASE,
  },
  mainFeature: {
    rawValue: TYPE_STRING,
    parsedValue: Object.assign({}, TYPE_NUMBER, {index: true}),
  },
  hasOffer: {type: Boolean, index: true},
}, {autoIndex: false});

// return {installment: 500,  installmentOption: 24}
ProductSchema.methods.getPossibleInstallments = function (downPayment = 0) {
  return this.installmentOptions.map(installmentOption => {
    let interestRate = this.interestRate * installmentOption / 100;
    let priceAndInterestRate = 1 + interestRate;
    let installment = Math.ceil((this.price * priceAndInterestRate - downPayment * priceAndInterestRate) / installmentOption);
    return {
      installment,
      installmentOption
    }
  });
};
let ProductModel = mongoose.model('Product', ProductSchema);
let ProductModelAR = mongoose.model('Product_AR', ProductSchema);
let ProductModelEN = mongoose.model('Product_EN', ProductSchema);

module.exports = {
  schema: ProductSchema,
  Product: {ar: ProductModelAR, en: ProductModelEN},
};