"use strict";
let fs = require('fs');
let path = require('path');  
class StateBase {
  constructor(stateManager, localesManager, skipPrompt) {
    this.stateManager = stateManager;
    this.localesManager = localesManager || (stateManager && stateManager.localesManager);
    this.repo = stateManager.repo;
    this.skipPrompt = skipPrompt || false;
    this.pause = false;
    this.needsInputVerification = false;
    this._needsPostBackProcessing = false;
  }

  /*
   * stateManager: a reference to the StateManager responsible for this execution;
   * data:          object with all data passed as needed or from previous streams. You can extract certain properties using destructing
   * callback:      is called with error and data to be passed as dictionary.
   */
  execute(stateManager, callback) {
    let data = this.stateManager.data;
    callback(null);
  }

  prompt(callback) {
    callback(null);
  }

  failurePrompt(callback) {
    callback(null, false, this.constructFailurePrompt());
  }

  successPrompt(callback) {
    callback(null, true, this.constructSuccessPrompt());
  }

  /*
    Get key and index from incoming message extra data:
    1- key found means that the user requested a certain state(eg. clicked on one of quick replies buttons) 
    then ignore the next state in stream and execute the state that has the key.
    2- if there is no key then get the next state in the stream and increment index.
  */
  getNextStatePosition({incomingMessage, latestValidStatePosition}) {
    let {key, index} = incomingMessage.extraData;
    if (key) {
      return {
        stream: key,
        index: index || 0
      };
    } else {
      return {
        stream: latestValidStatePosition.stream,
        index: latestValidStatePosition.index + 1,
      }
    }

  }

  verifyInput(callback) {
    callback(null, false);
  }

  managePrompts(prompt, callback) {
    this.stateManager.addPrompt(prompt);
    this.pauseStateManager();
    if (callback) {
      callback(null);
    }
  }

  pauseStateManager() {
    this.stateManager.pauseExecution(this.pause);
  }

  log() {
    console.log(this.constructor.name);
  }

  toString() {
    return this.constructor.name;
  }
  
  processPostBack(callback) {
    callback(null);
  }

  needsPostBackProcessing(incomingMessage) {
    return false;
  }

  getServicesMessage(text) {
    const self = this;
    return {
      text: text || self.localesManager.phrases.useOtherServicesToo,
      quick_replies: [
        {
          content_type: "text",
          title: self.localesManager.buttons.serviceShopping,
          payload: JSON.stringify({
            text: "Shopping",
            key: "shopping",
          })
        },
        {
          content_type: "text",
          title: self.localesManager.buttons.dailyDeals,
          payload: JSON.stringify({
            text: "Daily Deals",
            key: "dailyDeals"
          })
        },
        {
          content_type: "text",
          title: self.localesManager.buttons.serviceMaintenance,
          payload: JSON.stringify({
            text: "Maintenance / Installation",
            key: "maintenanceInstallation"
          })
        },
        {
          content_type: "text",
          title: self.localesManager.buttons.serviceStoreLocator,
          payload: JSON.stringify({
            text: "Store Locator",
            key: "storeLocator"
          })
        },
        {
          content_type: "text",
          title: self.localesManager.buttons.serviceCreditLimit,
          payload: JSON.stringify({
            text: "ask about limits",
            key: "askAboutLimits"
          })
        },
        {
          content_type: "text",
          title: self.localesManager.buttons.miniCash,
          payload: JSON.stringify({
            text: "mini cash",
            key: "miniCash"
          })
        }
      ]
    };
  }
  encodeImage(img) { 
    let pathToImg = global.appRoot + '/bot/resources/images/' + img;
    return fs.readFileSync(pathToImg, 'base64');
  }
  getImageServicesMessage() {
    const self = this;
    return {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title:self.localesManager.buttons.serviceShopping,
              image_url: self.localesManager.images.serviceShopping,
              subtitle: self.localesManager.phrases.serviceShoppingSubtitle,
              buttons: [
                {
                  type: "postback",
                  title: self.localesManager.buttons.serviceShopping,
                  payload: JSON.stringify({
                    text: "Shopping",
                    stream: "shopping",
                    index: 0
                  })
                }
              ]
            }, {
              title: self.localesManager.buttons.dailyDeals,
              image_url: self.localesManager.images.dailyDeals,
              subtitle: self.localesManager.phrases.serviceDailyDealsSubtitle,
              buttons: [
                {
                  type: "postback",
                  title:  self.localesManager.buttons.dailyDeals,
                  payload: JSON.stringify({
                    text: "Daily Deals",
                    stream: "dailyDeals",
                  })
                }
              ]
            }, {
              title:  self.localesManager.buttons.serviceMaintenance,
              image_url: self.localesManager.images.serviceMaintenance,
              subtitle: self.localesManager.phrases.serviceMaintenanceSubtitle,
              buttons: [
                {
                  type: "postback",
                  title:  self.localesManager.buttons.serviceMaintenance,
                  payload: JSON.stringify({
                    text: "Maintenance / Installation",
                    stream: "maintenanceInstallation",
                  })
                }
              ]
            }, {
              title: self.localesManager.buttons.serviceStoreLocator,
              image_url: self.localesManager.images.serviceStoreLocator,
              subtitle: self.localesManager.phrases.serviceStoreLocatorSubtitle,
              buttons: [
                {
                  type: "postback",
                  title: self.localesManager.buttons.serviceStoreLocator,
                  payload: JSON.stringify({
                    text: "Store Locator",
                    stream: "storeLocator",
                  })
                }
              ]
            }, {
              title: self.localesManager.buttons.serviceCreditLimit,
              image_url: self.localesManager.images.serviceCreditLimit,
              subtitle: self.localesManager.phrases.serviceCreditLimitSubtitle,
              /*default_action: {
                webview_height_ratio: "COMPACT",
              },*/
              buttons: [
                {
                  type: "postback",
                  title: self.localesManager.buttons.serviceCreditLimit,
                  payload: JSON.stringify({
                    text: "ask about limits",
                    stream: "askAboutLimits",
                  })
                }
              ]
            }, {
              title: self.localesManager.buttons.complains,
              image_url: self.localesManager.images.complains,
              subtitle: self.localesManager.phrases.serviceComplainsSubtitle,
              /*default_action: {
                webview_height_ratio: "COMPACT",
              },*/
              buttons: [
                {
                  type: "postback",
                  title: self.localesManager.buttons.complains,
                  payload: JSON.stringify({
                    text: "complains",
                    stream: "reportIssue",
                  })
                }
              ]
            }, {
              title: self.localesManager.buttons.talkToLiveAgent,
              image_url: self.localesManager.images.talkToLiveAgent,
              subtitle: self.localesManager.phrases.serviceTalkToCustomerSubtitle,
              /*default_action: {
                webview_height_ratio: "COMPACT",
              },*/
              buttons: [
                {
                  type: "postback",
                  title: self.localesManager.buttons.talkToLiveAgent,
                  payload: JSON.stringify({
                    text: "talk to live agent",
                    stream: "handleUserConfusion",
                  })
                }
              ]
            }, {
              title: self.localesManager.buttons.goToBtech,
              image_url: self.localesManager.images.goToBtech,
              subtitle: self.localesManager.phrases.serviceGoToBtechSubtitle,
              // webview_height_ratio: "full",
              /*default_action: {
                webview_height_ratio: "COMPACT",
              },*/
              buttons: [
                {
                  "type": "web_url",
                  "url": "https://www.example.com/?source=bibo&platform=messenger",
                  "title": self.localesManager.buttons.goToBtech,
                }
              ]
            }
          ]
        }
      }
    };
  }
}
module.exports = StateBase;
