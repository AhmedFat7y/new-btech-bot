"use strict";
let db = require('./../connector');
let mongoose = db.connect();

function createSchema() {
  return new mongoose.Schema({
    key: {type: String, index: true},
    value: {type: Object},
    locale: {type: String},
  }, {autoIndex: false});
}

let KVStoreSchema = createSchema();

let KVStoreModel = mongoose.model('KVStore', KVStoreSchema);
// let CategoryModelAR = mongoose.model('Category_AR', CategorySchema);
// let CategoryModelEN = mongoose.model('Category_EN', CategorySchema);

module.exports = {
  schema: KVStoreSchema,
  KVStore: {ar: KVStoreModel, en: KVStoreModel},
};