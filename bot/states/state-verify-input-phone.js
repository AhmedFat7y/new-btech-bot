"use strict";
const StateInputPhone = require('./state-input-phone');
class StateVerifyInputPhone extends StateInputPhone {
    constructor(stateManager, localesManager) {
        super(...arguments);
        this.pause = true;
        this.needsInputVerification = true;
        this.regex = /^\+?\d+$/g;
    }

    constructReply() {
        const self = this;
        return [
            {
                text: self.localesManager.questions.enterYourPhoneSecondTime
            }
        ];
    }

    constructFailurePrompt() {
        const self = this;
        return {
            text: self.localesManager.validations.enterValidMatchedPhone
        };
    }

    constructSuccessPrompt() {
        return {
            text: "This is valid matched Phone Number!"
        };
    }

    verifyInput(callback) {
        console.log('Verifying Inputs in state verify-input-phone');
        let { incomingMessage, user } = this.stateManager.data;
        let phoneNumber = incomingMessage.text.trim();
        let isValidPhoneNum = this.regex.test(phoneNumber);
        let isSuccess = false;
        if (isValidPhoneNum && phoneNumber === user.collectedData.phone) {
            isSuccess = true;
        }
        callback(null, isSuccess);
    }
}
module.exports = StateVerifyInputPhone;