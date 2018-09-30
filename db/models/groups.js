"use strict";
let db = require('./../connector');
let mongoose = db.connect();

let GroupsSchema = new mongoose.Schema({
  name: { type: String, index: true },
  filters: {type: Object, default: {}},
  displayedFilters: {type: Object, default: {}},
  createdAt: { type: Date, default: Date.now },
}, { autoIndex: false });

let GroupsModel = mongoose.model('Groups', GroupsSchema);

module.exports = {
  schema: GroupsSchema,
  Groups: GroupsModel,
};
