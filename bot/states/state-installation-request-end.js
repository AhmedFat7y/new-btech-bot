"use strict";
const StateBase = require('./state-base');
const {InstallationRequest} = require('../../db/models/installation-request');


class StateInstallationRequestEnd extends StateBase {
  constructor(stateManager) {
    super(...arguments);
    this.pause = true;
  }

  constructReply() {
    const self = this;
    return [
      {
        text: self.localesManager.phrases.thanksForFillingTheForm
      },
      this.getImageServicesMessage()
    ];
  }

  execute(callback) {
    let {user} = this.stateManager.data;
    console.log('Executing State Installation request End');
    this.skipPrompt = false;
    InstallationRequest.create({
      fbId: user.fbId,
      name: user.collectedData.name,
      phone: user.collectedData.phone,
      address: user.collectedData.address,
      product: {
        brand: user.collectedData.productBrand,
        category: user.collectedData.productCategory,
      }
    }, (err, installationRequest) => {
      this.prompt(callback);
    });

  }

  prompt(callback) {
    this.managePrompts(this.constructReply());
    callback(null);
  }
}
module.exports = StateInstallationRequestEnd;