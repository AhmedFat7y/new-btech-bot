const async = require('async');

let {Message} = require('../../db/models/message');
let {KVStore} = require('../../db/models/kv-store');

const StateBase = require('./state-base');

class StateLoadConvoState extends StateBase {
  execute(callback) {
    let data = this.stateManager.data;
    let {incomingMessage} = this.stateManager.data;
    console.log('Loading conversation state', incomingMessage.sender);
    async.parallel([
      parallelCallback => KVStore.en.findOne({key: 'global-switch'}, parallelCallback),
      parallelCallback => Message.findOne({
        fbId: incomingMessage.sender,
        replied: true,
        isFailure: false
      }).sort({timestamp: -1}).exec(parallelCallback),
    ], (err, [globalSwitch, message]) => {
      if (err) {
        console.error('Error Loading Convo State!', err);
      }
      data.globalSwitchValue = (globalSwitch && globalSwitch.value) || 'off';
      data.previousMesage = message;
      data.latestValidStatePosition = message && message.statePosition || null;
      callback(err);
    });
  }
}
module.exports = StateLoadConvoState;