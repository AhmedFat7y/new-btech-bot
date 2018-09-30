"use strict";
const StateBase = require('./state-base');
const STATE_NAME = 'StateAskAboutUserEmail';

class StateAskAboutUserEmail extends StateBase {
    constructor(stateManager, localesManager) {
        super(...arguments);
        this.pause = true;
        this.needsInputVerification = true;
    }

    constructReply() {
        const self = this;
        return {
            text: self.localesManager.questions.enterYourEmail,
        };
    }


    execute(callback) {
        console.log('Executing State input email');
        this.skipPrompt = false;
        this.prompt(callback);
    }

    prompt(callback) {
        this.managePrompts(this.constructReply(), callback);
    }

    constructFailurePrompt() {
        const self = this;
        return {
            text: self.localesManager.validations.enterValidEmail,
        };
    }

    constructSuccessPrompt() {
        return {
            text: "This is valid Email!"
        };
    }
    failurePrompt(callback) {
        callback(null, false, this.constructFailurePrompt());
    }

    successPrompt(callback) {
        callback(null, true, this.constructSuccessPrompt());
    }

    validateEmail(email) {
        let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    verifyInput(callback) {
        console.log('Verifying Inputs in state input email');
        let {incomingMessage, user} = this.stateManager.data;
        //checking user's email validity
        if (this.validateEmail(incomingMessage.text.trim())) {
            user.collectedData.email = incomingMessage.text.trim();
            callback(null, true);
        }
        else {
            callback(null, false);
        }

    }
}
module.exports = StateAskAboutUserEmail;