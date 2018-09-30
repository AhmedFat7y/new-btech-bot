"use strict";
const StateBase = require('./state-base');

class StateMaintenanceRequest extends StateBase {
  constructor(stateManager) {
    super(...arguments);
    // this.pause = true;
  }

  constructReply() {
    const self = this;
    return {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": self.localesManager.questions.fillTheFormOnlineOrHere,
          "buttons": [
            {
              "type": "web_url",
              "url": `https://www.example.com/${self.localesManager.locale}/support/#installation?source=bibo&platform=messenger`,
              "title": self.localesManager.buttons.fillOnWebsite,
              "webview_height_ratio": "tall"
            },
            {
              "type": "postback",
              "title": self.localesManager.buttons.fillHere,
              "payload": JSON.stringify({})
            }
          ]
        }
      }
    };
  }

  execute(callback) {
    console.log('Executing State maintenance request');
    callback(null);
    // this.skipPrompt = false;
    // this.prompt(callback);
  }

  prompt(callback) {
    this.managePrompts(this.constructReply());
    callback(null);
  }
}
module.exports = StateMaintenanceRequest;