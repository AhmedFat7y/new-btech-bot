const StateBase = require('./state-base');

class StateSaveIssue extends StateBase {
  constructor() {
      super(...arguments);
      this.pause = false;
      this.needsInputVerification = false;
    }

  constructReply(complaintNo) {
    const self = this;
    let messages = [];
    messages.push(
      {
        text: `${self.localesManager.phrases.weGotYourFeedback}#${complaintNo}`
      },
      {
        text: self.localesManager.phrases.customerServiceFollowUpComplain
      }
    );
    return messages;
  }

  execute(callback) {
    let {incomingMessage, user} = this.stateManager.data;
    let text = user.complaint;
    let self = this;
    console.log("BEFORE SAVE");
    user.complaint = [];
    this.skipPrompt = false;
    // Added call back to make sure complain was saved and complain number is genersted. 
    self.repo.saveIssue(user, text, function(complaintNo) {
      self.prompt(callback, complaintNo);
    });
  }

  prompt(callback, complaintNo) {
    this.managePrompts(this.constructReply(complaintNo));
    callback(null);
  }
}

module.exports = StateSaveIssue;
