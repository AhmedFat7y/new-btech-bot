const StateBase = require('./state-base');
class StateBibo extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
  }

  constructReply() {
    return this.getImageServicesMessage();
  }

  execute(callback) {
    console.log('Executing State Biboo');
    this.skipPrompt = false;
    this.prompt(callback);
  }

  prompt(callback) {
    let self = this;
    let AboutBiboMessages = [];
    AboutBiboMessages.push({text: self.localesManager.phrases.aboutBibo });
    AboutBiboMessages.push(
      {text: this.localesManager.phrases.welcomeQuickReplies},
      self.constructReply()
    );
    this.stateManager.addPrompt(AboutBiboMessages);
    // this.stateManager.addPrompt(this.constructReply());
    this.pauseStateManager();
    callback(null);
  }
}

module.exports = StateBibo;
