"use strict";
let db = require('./../connector');
let mongoose = db.connect();

let InstallationRequestSchema = new mongoose.Schema({
  name: {type: String},
  phone: {type: String},
  product: {
    category: {type: String},
    brand: {type: String},
  },
  isHandled: {type: Boolean, default: false},

}, {autoIndex: false});

let InstallationRequestModel = mongoose.model('InstallationRequest3', InstallationRequestSchema);

module.exports = {
  schema: InstallationRequestSchema,
  InstallationRequest: InstallationRequestModel,
};