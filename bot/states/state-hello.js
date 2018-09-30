const StateBase = require('./state-base');
class StateHello extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
  }

  constructReply() {
    // return this.getServicesMessage(this.localesManager.phrases.welcomeQuickReplies);
    return this.getImageServicesMessage();
  }

  execute(callback) {
    console.log('Executing State Hello');
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    let self = this;
    let welcomeMessagesPhrases = self.localesManager.phrases.welcomeToChatBot;
    let welcomeMessages = [];
    welcomeMessagesPhrases.map((item) => {
      welcomeMessages.push({text: item });
    });
    welcomeMessages.push({text: this.localesManager.phrases.welcomeQuickReplies}, self.constructReply());
    this.stateManager.addPrompt(welcomeMessages);
    // this.stateManager.addPrompt(this.constructReply());
    this.pauseStateManager();
    callback(null);
  }
}

module.exports = StateHello;
