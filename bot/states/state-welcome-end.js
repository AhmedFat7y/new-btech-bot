"use strict";
const StateBase = require('./state-base');

class StateWelcomeEnd extends StateBase {
    constructor(stateManager) {
        super(...arguments);
        this.pause = true;
    }

    constructReply() {
        const self = this;
        return [{
            text: self.localesManager.phrases.thanksForWelcomeReplies + self.stateManager.data.user.collectedData.name
        },
        self.getImageServicesMessage()
        ];
    }

    execute(callback) {
        console.log('Executing Welcome state end');
        this.skipPrompt = false;
        this.prompt(callback);
    }

    prompt(callback) {
        this.managePrompts(this.constructReply(), callback);
    }

}
module.exports = StateWelcomeEnd;