"use strict";
const StateBase = require('./state-base');
class StateInputPhone extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
    this.needsInputVerification = true;
    this.regex = /^010\d{8}$|^012\d{8}$|^011\d{8}$/g;
  }

  constructReply() {
    const self = this;
    return [
      {
        text: self.localesManager.questions.enterYourPhone
      }
    ];
  }

  constructFailurePrompt() {
    const self = this;
    return {
      text: self.localesManager.validations.enterValidPhone
    };
  }

  constructSuccessPrompt() {
    return {
      text: "This is valid Phone Number!"
    };
  }

  execute(callback) {
    console.log('Executing State input phone');
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    this.stateManager.addPrompt(this.constructReply());
    this.pauseStateManager();
    callback(null);
  }

  failurePrompt(callback) {
    callback(null, false, this.constructFailurePrompt());
  }

  successPrompt(callback) {
    callback(null, true, this.constructSuccessPrompt());
  }

//parseArabic function used to convert an input of Arabic numbers to English number
   parseArabic(str) {
      return str.replace(/[٠١٢٣٤٥٦٧٨٩]/g, function (d) {
        return d.charCodeAt(0) - 1632;
      });
  }
  verifyInput(callback) {
    console.log('Verifying Inputs in state input-phone');
    let {incomingMessage, user} = this.stateManager.data;
    let phoneNumber = incomingMessage.text.trim();


    // this if condition checks if the phone number is in the range of arabic numbers
    var arabicNumbers = /[\u0660-\u0669]/;
    if(arabicNumbers.test(phoneNumber))
    {

      phoneNumber=this.parseArabic(phoneNumber);
    }
    let isSuccess = this.regex.test(phoneNumber);
    if (isSuccess) {
      user.collectedData.phone = phoneNumber;
    }
    callback(null, isSuccess);
  }
}
module.exports = StateInputPhone;
