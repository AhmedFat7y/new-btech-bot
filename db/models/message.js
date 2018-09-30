"use strict";
let db = require('./../connector');
let mongoose = db.connect();

let MessageSchema = new mongoose.Schema({
  fbId: {type: String, index: true},
  gender: {type: String},
  joinedAt: {type: Date},
  text: {type: String},
  type: {type: String},
  extraData: {type: Object},
  timestamp: {type: Date, default: Date.now},
  replied: {type: Boolean, default: false},
  replies: [{}],
  statePosition: {type: Object},
  isFailure: {type: Boolean}
}, {autoIndex: false});

let MessageModel = mongoose.model('Message4', MessageSchema);

module.exports = {
  schema: MessageSchema,
  Message: MessageModel,
};
