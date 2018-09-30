let {Message} = require('../../db/models/message');
const StateBase = require('./state-base');
class StateSaveMessage extends StateBase {
  execute(callback) {
    let data = this.stateManager.data;
    let {incomingMessage, user} = this.stateManager.data;
    incomingMessage.fbId = incomingMessage.sender;
    console.log('Saving Message:', incomingMessage);
    let message = Object.assign({}, incomingMessage);
    message.gender  = user.gender;
    message.joinedAt = user.joinedAt;
    Message.create(message, (err, message) => {
      data.message = message;
      callback(err);
    });
  }
}
module.exports = StateSaveMessage;
