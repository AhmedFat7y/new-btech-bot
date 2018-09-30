"use strict";
const request = require('request');
const {UNIFONIC_AUTHENTICATION} = require('../../config');
const APP_SID = UNIFONIC_AUTHENTICATION.APP_SID;

function getMessageStatus(messageId, callback) {
  request({
    method: 'POST',
    url: 'http://api.unifonic.com/rest/Messages/GetMessageIDStatus',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `AppSid=${APP_SID}&MessageID=${messageId}`
  }, function (error, response, body) {
    console.log('Status:', response.statusCode);
    console.log('Headers:', JSON.stringify(response.headers));
    console.log('Response:', body);
    if (callback) {
      callback(...arguments);
    }
  });
};

function sendMessage(phoneNumber, messageContent, callback) {
  request({
    method: 'POST',
    url: 'http://api.unifonic.com/rest/Messages/Send',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `AppSid=${APP_SID}&Recipient=${phoneNumber}&Body=${messageContent}&SenderID=B.TECH`
  }, function (error, response, body) {
    if(error) {
      console.error('Error Sending Mesages', error);
    } else {
      console.log('Response:', body);
    }
    if (callback) {
      callback(...arguments);
    }
  });
};

function sendVerificationCode(phoneNumber, verificationCode, callback) {
  // skip for now
  if(phoneNumber.startsWith('+')) {
    phoneNumber = phoneNumber.slice(1);
  } else if (phoneNumber.startsWith('1')) {
    phoneNumber = '20' + phoneNumber;
  } else if (phoneNumber.startsWith('0')) {
    phoneNumber = '2' + phoneNumber;
  }
  sendMessage(phoneNumber, `رقم التأكيد: ${verificationCode}`, callback);
  // callback(null);
}

function checkIfReachable(phoneNumber, callback) {

  request({
    method: 'POST',
    url: 'http://api.unifonic.com/rest/NumberInsight',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `AppSid=${APP_SID}&Recipient=${phoneNumber}&SenderID=B.TECH`
  }, function (error, response, body) {
    console.log('Status:', response.statusCode);
    console.log('Headers:', JSON.stringify(response.headers));
    console.log('Response:', body);
    if (callback) {
      callback(...arguments);
    }
  });
};

module.exports = {
  checkIfReachable,
  sendMessage,
  sendVerificationCode,
};