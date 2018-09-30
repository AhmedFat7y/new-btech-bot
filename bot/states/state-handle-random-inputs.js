const request = require('request');
const async = require('async');

const config = require('../../config');
const StateBase = require('./state-base');
const WitMapper = require('../bot-utilities/witai-mapper');

const regexEmojies = new RegExp(`^(?:${require('emoji-regex')().source})+$`);
const regexWhiteSpace = /\s+/g;

class StateHandleRandomInputs extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
    this.stateManager = stateManager;
  }

  mapMultipleReplies(items) {
    let result = [];
    items.map((item) => {
      result.push({text: item });
    });
    return result;
  }

  constructQuickRepliesSecondError(text) {
    const self = this;
    return {
      text: text || self.localesManager.phrases.useOtherServicesToo,
      quick_replies: [
        {
          content_type: "text",
          title: self.localesManager.buttons.chatServices,
          payload: JSON.stringify({
            stream: 'hi',
            index: 0
          })
        },
        {
          content_type: "text",
          title: self.localesManager.buttons.chatWithLiveAgent,
          payload: JSON.stringify({
            stream: 'handleUserConfusion',
            index: 0
          })
        }
      ]
    };
  }

  /* 
    Construct reply for the first error to be used in construct reply according
    to the errors counter
  */
  constructFirstErrorReply() {
    const self = this;
    const phrases = self.localesManager.phrases;
    let messages = [];
    const firstRandomError = phrases.randomInputReplyTrial;
    messages.push(
      {text: firstRandomError },
      {text: phrases.welcomeQuickReplies},
      self.getImageServicesMessage(phrases.welcomeQuickReplies)
    );
    return messages;
  }

  /* 
    Construct reply for the second error to be used in construct reply according
    to the errors counter
  */
  constructSecondErrorReply() {
    const self = this;
    const phrases = self.localesManager.phrases;
    let messages = [];
    const secondRandomError = phrases.randomInputReplySecondTrial;
    messages.push({text: secondRandomError},
      this.constructQuickRepliesSecondError( phrases.randomQuickRepliesSecondTrial)
    );
    return messages;
  }

  constructReply(extraReplies) {
    let {user} = this.stateManager.data;
    const self = this;
    user.incremenetInvalidMessagesCounter();

    if (user.getInvalidMessagesCounter() === 1) {
      return self.constructFirstErrorReply().concat(extraReplies || []);
    }

    if (user.getInvalidMessagesCounter() === 2) {
      return self.constructSecondErrorReply().concat(extraReplies || []);
    }

    return [
      {
        text: self.localesManager.phrases.anAgentWillContact
      }
    ].concat(extraReplies || []);

  }

  setIsFailure(failureFlag) {
    this.stateManager.setIsFailure(failureFlag);
    this.pause = failureFlag;
  }
  replayEmojies(incomingText) {
    return {
      text: incomingText
    };
  }

  askWitai(callback) {
    let {incomingMessage, message} = this.stateManager.data;
    request({
      url: 'https://api.wit.ai/message',
      headers: {
        Authorization: `Bearer ${config.WITAI.ACCESS_TOKEN_AR}`
      },
      qs: {
        v: '20170307',
        q: incomingMessage.text,
        msg_id: message.id,
        thread_id: message.fbId,
        verbose: true
      },
      json: true
    }, (err, res, body) => {
      console.log(JSON.stringify(body));
      callback(err, body);
    });
  }

  runState(state, callback) {
    if (!state) {
      this.managePrompts(this.constructReply(), callback);
    } else {
      new state(this.stateManager).execute(callback);
    }
  }

  execute(callback) {
    // let self = this;
    // let incomingText = self.stateManager.data.incomingMessage.text;
    // if( incomingText && regexEmojies.test(incomingText.replace(regexWhiteSpace, '')) ) {
    //   this.managePrompts(this.replayEmojies(incomingText), callback);
    // } else {
    //   self.stateManager.data.user.incremenetInvalidMessagesCounter();
    //   self.setIsFailure(true);
    //   let previousMessage = this.stateManager.data.previousMesage;
    //   let replies = (previousMessage && previousMessage.replies) || [this.getServicesMessage()];
    //   this.managePrompts(this.constructReply(replies), callback);
    // }
    // async.waterfall([
    //   nextFunc => this.askWitai(nextFunc),
    //   (res, nextFunc) => {
    //     let data = res.entities || {};
    //     data = Object.keys(data).map(key => {
    //       let entityValues = data[key];
    //       return entityValues.map(entityValue => {
    //         return {
    //           name: key,
    //           'confidence_index': entityValue.confidence,
    //           value: entityValue.value,
    //         };
    //       });
    //     });
    //     nextFunc(null, JSON.stringify(data, null, 2));
    //   },
    //   (text, nextFunc) => this.managePrompts({text}, nextFunc),
    // ], callback);
    let mapper = new WitMapper(this.stateManager);
    let self = this;
    async.waterfall([
      nextFunc => self.askWitai(nextFunc),
      (res, nextFunc) => mapper.get(res.entities || {}, nextFunc),
      (stateOrPrompt, nextFunc) => {
        if (!stateOrPrompt || stateOrPrompt.prototype instanceof StateBase) {
          self.runState(stateOrPrompt, nextFunc);
        } else {
          self.managePrompts(stateOrPrompt, nextFunc);
        }
      }
    ], callback);
  }
}
module.exports = StateHandleRandomInputs;
