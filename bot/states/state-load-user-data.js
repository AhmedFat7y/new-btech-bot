"use strict";
const async = require('async');
const {User} = require('../../db/models/user');
const fbapi = require('../apis-wrappers/facebook-wrapper');
const StateBase = require('./state-base');

class StateLoadUserData extends StateBase {
  loadUserIfExists(fbId, callback) {
    User.findOne({ fbId: fbId }, (err, user) => {
      if (err) {
        console.error(`Error looking up user: ${fbId}`);
      }
      if (user) {
        console.log('Found User:', fbId);
        callback({ skip: true }, user);
      } else {
        console.log('First Time User:', fbId);
        callback(null);
      }
    });
  }

  saveUserIfNotExists(fbId, {first_name, last_name, profile_pic, timezone, locale, gender}, callback) {
    console.log('Saving User Data:', fbId);
    this.stateManager.data.isFirstTime = true;
    User.create({
      fbId: fbId,
      firstName: first_name,
      lastName: last_name,
      profilePhoto: profile_pic,
      timezone: timezone,
      locale: 'ar',
      gender: gender,
    }, callback);
  }

  execute(callback) {
    let self = this;
    let data = self.stateManager.data;
    let localesManager = self.localesManager;
    let {incomingMessage} = self.stateManager.data;
    let fbId = incomingMessage.sender;
    console.log('Loading User Data:', incomingMessage.sender);
    async.waterfall([
      nextFunc => self.loadUserIfExists(fbId, nextFunc),
      nextFunc => fbapi.getUserInfo(fbId, nextFunc),
      (rawData, nextFunc) => self.saveUserIfNotExists(fbId, rawData, nextFunc)
    ], (err, user) => {
      data.user = user;
      const { resetInvalidMsgs, stream, key } = incomingMessage.extraData;
      if (resetInvalidMsgs && (user.shouldSendToSupport() || stream === 'hi')) {
        user.clearInvalidMessages();
      }
      if (incomingMessage.source === 'ADS' && incomingMessage.source === 'OPEN_THREAD') {
        user.isEnabled = true;
        if (!(key || stream)) {
          incomingMessage.extraData.stream = 'hi';
        }
      }
      localesManager.setLocale(user.getUsableLocale());
      localesManager.setGender(user.gender);
      if (err && !err.skip) {
        console.error('Error Executing state-load-user-data!', err);
      } else {
        err = null;
      }
      callback(err);
    });
  }
}
module.exports = StateLoadUserData;