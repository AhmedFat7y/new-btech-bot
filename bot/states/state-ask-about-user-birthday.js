"use strict";
const StateBase = require('./state-base');
const STATE_NAME = 'StateAskAboutUserBirthday';
const moment = require('moment');
class StateAskAboutUserBirthday extends StateBase {
    constructor(stateManager, localesManager) {
        super(...arguments);
        this.pause = true;
        this.needsInputVerification = true;
    }

    constructReply() {
        const self = this;
        return {
            text: self.localesManager.questions.enterYourBirthday,
        };
    }

    execute(callback) {
        console.log('Executing State input birthday');
        this.skipPrompt = false;
        this.prompt(callback);
    }

    prompt(callback) {
        this.managePrompts(this.constructReply(), callback);
    }

    constructFailurePrompt() {
        const self = this;
        return {
            text: self.localesManager.validations.enterValidBirthday,
        };
    }

    constructSuccessPrompt() {
        return {
            text: "This is valid Birthday!"
        };
    }
    failurePrompt(callback) {
        callback(null, false, this.constructFailurePrompt());
    }

    successPrompt(callback) {
        callback(null, true, this.constructSuccessPrompt());
    }

    verifyInput(callback) {
        console.log('Verifying Inputs in state input birthday');
        let {incomingMessage, user} = this.stateManager.data;
        //checking user's birthday validity
        var dateFormat = 'YYYY-MM-DD';
        let isValidBirthday = moment(incomingMessage.text).isValid();
        if (isValidBirthday) {
            user.collectedData.birthday = incomingMessage.text.trim();
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    }
}
module.exports = StateAskAboutUserBirthday;