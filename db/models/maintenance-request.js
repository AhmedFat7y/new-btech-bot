"use strict";
let db = require('./../connector');
let mongoose = db.connect();

let MaintenanceRequestSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String },
  isHandled: { type: Boolean },
  product: {
    category: { type: String },
    brand: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
  handledAt: { type: Date, default: Date.now },
}, { autoIndex: false });

let MaintenanceRequestModel = mongoose.model('MaintenanceRequest4', MaintenanceRequestSchema);

module.exports = {
  schema: MaintenanceRequestSchema,
  MaintenanceRequest: MaintenanceRequestModel,
};
