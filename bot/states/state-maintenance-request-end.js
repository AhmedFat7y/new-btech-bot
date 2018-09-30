"use strict";
const StateBase = require('./state-base');
const {MaintenanceRequest} = require('../../db/models/maintenance-request');

class StateMaintenanceRequestEnd extends StateBase {
  constructor(stateManager) {
    super(...arguments);
    this.pause = true;
  }

  constructReply() {
    const self = this;
    return [
      {
        text: self.localesManager.phrases.thanksForMaintenanceForm + ` ${self.phone}`
      },
      self.getImageServicesMessage()
    ];
  }

  execute(callback) {
    let {user} = this.stateManager.data;
    console.log('Executing State maintenance request End');
    this.skipPrompt = false;
    this.phone = user.collectedData.phone;
    MaintenanceRequest.create({
      fbId: user.fbId,
      name: user.collectedData.name,
      phone: user.collectedData.phone,
      address: user.collectedData.address,
      product: {
        category: user.collectedData.productCategory,
        brand: user.collectedData.productBrand,
      }
    }, (err, maintenanceRequest) => {
      user.visitRequest = {};
      this.prompt(callback);
    });
  }

  prompt(callback) {
    this.managePrompts(this.constructReply());
    callback(null);
  }

}
module.exports = StateMaintenanceRequestEnd;