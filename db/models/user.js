"use strict";
let db = require('./../connector');
let mongoose = db.connect();
let REQUEST_TYPE = {
  INSTALLATION_REQUEST: 'INSTALLATION_REQUEST',
  MAINTENANCE_REQUEST: 'MAINTENANCE_REQUEST',
  REMAINING_INSTALLMENTS: 'REMAINING_INSTALLMENTS',
  CREDIT_LIMIT: 'CREDIT_LIMIT',
};
let UserSchema = new mongoose.Schema({
  fbId: { type: String, index: true },
  firstName: { type: String },
  lastName: { type: String },
  locale: { type: String, default: 'ar' },
  gender: { type: String, default: 'male' },
  timezone: { type: Number },
  profilePhoto: { type: String },
  nationalId: { type: String },
  phone: { type: String },
  phoneIsVerified: { type: Boolean, default: false },
  isEnabled: {type: Boolean, default: false},
  collectedData: {
    nationalId: { type: String },
    phone: { type: String },
    sms: {
      verificationCode: { type: String },
      messageId: { type: String },
      numberOfTrials: { type: String },
    },
    requestType: { type: String },
    name: { type: String },
    address: { type: String },
    productCategory: { type: String },
    productBrand: { type: String },
    birthday: { type: String },
    email: { type: String }
  },
  filters: {
    brand: {
      magentoId: { type: String },
      name: { type: String },
    },
    pricing: {
      cash: [{ type: Number }],
      downPayment: { type: Number },
      installment: [{ type: Number }],
    },
    mainFeature: {
      searchValues: [{ type: Number }],
    },
    isEnabled: {type: Boolean, default: false},
    currentCategory: {
      magentoId: { type: Number },
      name: { type: String },
      mainFeatureText: { type: String },
    },
    hasOffer: { type: Boolean }
  },
  inValidMessagesCounter: { type: Number, default: 0 },
  isWarned: { type: Boolean, default: false },
  needsSupport: { type: Boolean },
  joinedAt: { type: Date, default: Date.now },
  needsSupportAt: { type: Date, default: Date.now },
  complaint: [String]
}, { autoIndex: false });

UserSchema.methods.toggleLanguage = function () {
  if (this.locale.slice(0, 2) === 'en') {
    this.locale = 'ar';
  } else {
    this.locale = 'en';
  }
};

UserSchema.methods.getUsableLocale = function () {
  let locale = (this.locale && this.locale.slice(0, 2)) || 'en';
  let supportedLocales = ['ar', 'en'];
  if (supportedLocales.indexOf(locale) === -1) {
    locale = 'en';
  }
  return locale;
};

UserSchema.methods.switchToCategory = function (category) {
  this.filters = {
    currentCategory: category
  };
  this.markModified('filters');
  return this;
};

UserSchema.methods.getFullName = function () {
  return (this.firstName || '') +  ' ' + (this.lastName || '');
};

UserSchema.methods.incremenetInvalidMessagesCounter = function () {
  this.inValidMessagesCounter++;
};

// Get counter to be used in random text
UserSchema.methods.getInvalidMessagesCounter = function() {
  return this.inValidMessagesCounter;
};

UserSchema.methods.shouldSendToSupport = function () {
  return this.inValidMessagesCounter > 2;
};

UserSchema.methods.setIsWarned = function () {
  this.isWarned = true;
  this.needsSupport = true;
};

UserSchema.methods.clearInvalidMessages = function () {
  this.inValidMessagesCounter = 0;
  this.isWarned = false;
};

UserSchema.virtual('filters.locale').get(function () {
  return this.locale;
});

UserSchema.set('toObject', { virtuals: true });

let UserModel = mongoose.model('User4', UserSchema);

module.exports = {
  schema: UserSchema,
  User: UserModel,
  REQUEST_TYPE,
};
