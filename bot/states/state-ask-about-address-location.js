"use strict";
const async = require('async');

const StateBase = require('./state-base');
const googleMapsAPIs = require('../apis-wrappers/google-maps-wrapper');
const fbapi = require('../apis-wrappers/facebook-wrapper');
const STATE_NAME = 'StateAskAboutCategoryFilters';

class StateAskAboutAddressLocation extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
    this.needsInputVerification = true;
  }
  constructReply() {
    let self = this;
    return {
      text: self.localesManager.questions.sendLocation,
      quick_replies: [
        {
          content_type: 'location',
        }
      ]
    };
  }

  execute(callback) {
    console.log('Executing State askAboutAddressLocation');
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    this.managePrompts(this.constructReply());
    callback(null);
  }

  constructFailurePrompt() {
    const self = this;
    return {
      text: self.localesManager.validations.enterValidLocation,
      quick_replies: [
        {
          content_type: "location"
        }
      ]
    };
  }

  constructSuccessPrompt() {
    return {
      text: "Getting you a nearest store!"
    };
  }

  failurePrompt(callback) {
    callback(null, false, this.constructFailurePrompt());
  }

  successPrompt(callback) {
    callback(null, true, this.constructSuccessPrompt());
  }

  checkValidAddress(address, callback) {
    googleMapsAPIs.getCoordinatesFromAddress(address, (err, coordinates) => {
      let isSuccess = coordinates && !err;
      this.stateManager.data.location = {
        data: `${coordinates.lat},${coordinates.lng}`,
        type: 'location'
      };
      callback(null, isSuccess);
    });
  }

  verifyInput(callback) {
    console.log('Verifying Inputs in state ask about address');
    let {incomingMessage, user} = this.stateManager.data;
    let address = incomingMessage.text;
    let attachments = incomingMessage.extraData.attachments || [];
    let locationAttachmentArr = attachments.filter(attachment => attachment.type === fbapi.ATTACHMENT_TYPE.LOCATION);
    if (address) {
      this.checkValidAddress(address, callback);
    } else if (locationAttachmentArr && locationAttachmentArr.length) {
      this.stateManager.data.location = locationAttachmentArr[0];
      callback(null, true);
    } else {
      callback(null, false);
    }
  }
}
module.exports = StateAskAboutAddressLocation;
