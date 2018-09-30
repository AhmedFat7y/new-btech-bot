"use strict";
const {StateManager} = require('./state-manager');
const {FB_AUTHENTICATION} = require('../config');
const fbapi = require('./apis-wrappers/facebook-wrapper');
const streams = require('./streams');


function verifyWebHook(req, res) {
  let verifyToken = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  if (verifyToken === FB_AUTHENTICATION.WEB_HOOK_VERIFY_TOKEN) {
    res.send(challenge);
    fbapi.doSubscribeRequest();
  } else {
    res.status(403).send('Sorry!, Invalid verification code!')
  }
}

function processIncomingEvent(req, res) {
  res.sendStatus(200);
  StateManager.createManagers(req.body);
}

module.exports = {
  verifyWebHook,
  processIncomingEvent
};