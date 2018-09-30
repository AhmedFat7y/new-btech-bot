const StateBase = require('./state-base');

class StateConfirmIssue extends StateBase {
    constructor() {
        super(...arguments);
        this.pause = true;
        this.needsInputVerification = false;
      }

      constructReply() {
        const self = this;
        console.log('IN CONFIRM RESPONSE');
        console.log(self.localesManager.buttons.saveIssue);
        console.log(self.localesManager.buttons.pendingIssue);
        return {
            text: self.localesManager.questions.wantToAddAnything,
            quick_replies: [
                {
                    content_type: "text",
                    title: self.localesManager.buttons.saveIssue,
                    payload: JSON.stringify({
                        // text: "Save Issue",
                        stream: "reportIssue", 
                        index: 2
                    })
                },
                {
                    content_type: "text", 
                    title: self.localesManager.buttons.pendingIssue,
                    payload: JSON.stringify({
                        // text: "Add To Issue", 
                        stream: "reportIssue",
                        index: 0 
                    })
                }
            ]
        };
      }

      execute(callback) {
          this.skipPrompt = false;
          this.prompt(callback);

      }

      prompt(callback) {
          this.stateManager.addPrompt(this.constructReply());
          this.pauseStateManager();
          callback(null);
      }
        constructFailurePrompt() {
            return 'Invalid input';
        }

}

module.exports = StateConfirmIssue;
