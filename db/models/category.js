// db.getCollection('products').aggregate(
//   {$match: {'category.name': 'Mobiles'}},
//   {$group: {_id: {mainFeature: '$mainFeature.parsedValue'}}},
//   {$sort: {'_id.mainFeature': -1}},
//   {$project: {"x": '$_id.mainFeature', _id: 0}}
// ).toArray().map(function(t){ return t.x});

"use strict";
let db = require('./../connector');
let mongoose = db.connect();

function createSchema() {
  return new mongoose.Schema({
    magentoId: {type: Number, index: true, unique: true},
    name: {type: String},
    normalizedName: {type: String},
    options: {type: [{label: String, value: [Number]}]},
    mainFeatureText: {type: String, trim: true},
    mainFeatureKeys: [{type: String}],
    unit: {type: String},
    brands: [
      {
        magentoId: {type: Number},
        name: {type: String},
        supported: {type: Boolean, default: false},
        semiSupported: {type: Boolean, default: false},
      }
    ],
    parentMagentoId: {type: Number, index: true},
    hasChildren: {type: Boolean},
    uniqueValues: [{type: Number}],
    uniquePrices: [{type: Number}],
    uniqueInstallments: [{type: Number}],
    cashOptions: {type: [{label: String, value: [Number]}]},
    minicashOptions: {type: [{label: String, value: [Number]}]},
    supported: {type: Boolean},
    hasOffer: {type : Boolean}
  }, {autoIndex: false});
}

let CategorySchema = createSchema();

let CategoryModel = mongoose.model('Category', CategorySchema);
let CategoryModelAR = mongoose.model('Category_AR', CategorySchema);
let CategoryModelEN = mongoose.model('Category_EN', CategorySchema);

module.exports = {
  schema: CategorySchema,
  Category: {ar: CategoryModelAR, en: CategoryModelEN},
};
