"use strict";
const async = require('async');
const _streams = require('./streams');
const fbapi = require('./apis-wrappers/facebook-wrapper');
const StateSendPrompt = require('./states/state-send-prompt');
const StateVerifyInput = require('./states/state-verify-inputs');
const StateProcessPostBack = require('./states/state-process-postback');
const StateHandleRandomInputs = require('./states/state-handle-random-inputs');
const StateConfirmIssue = require('./states/state-confirm-issue')
const {EVENT_TYPE} = require('./apis-wrappers/facebook-wrapper')
const StateEnding = require('./states/state-ending');
const LocalesManager = require('./locales');
const Repo = require('../db/repos/repo');
const StateHandleUserConfusion = require('./states/state-handle-user-confusion');
// merge objects into the first one
function merge(...objects) {
  let out = objects[0];
  objects = objects.slice(1);
  for (let obj of objects) {
    obj = obj || {};
    Object.keys(obj).forEach(key => out[key] = obj[key]);
  }
  return out;
}

class StateManager {

  constructor(streams, data) {
    this.streams = streams; //streams obejct
    this.data = data || {}; //incoming message object
    this.prompt = null;
    this.pause = false;
    this.isFailure = false;
    this.noReply = false;
    this.needsInputVerification = false;
    this.localesManager = new LocalesManager(this);
    this.repo = new Repo(this);
  }

  setIsFailure(failureFlag) {
    this.isFailure = failureFlag;
    if (failureFlag) {
      this.data.nextStatePosition = this.data.latestValidStatePosition;
    }
  }
  setNoReply(noReplyFlag) {
    this.noReply = noReplyFlag;
  }
  getStateClass(statePosition) {
    return this.streams[statePosition.stream][statePosition.index];
  }

  buildAsyncParallel(parallelStates, callback) {
    let self = this;
    let parallelCalls = [];
    for (let state of parallelStates) {
      parallelCalls.push(self.buildAsyncFunction(state));
    }
    async.parallel(parallelCalls, (err, results) => {
      results = results || [];
      results.unshift(self.data);
      self.data = merge(...results);
      callback(err);
    });
  }

  buildAsyncFunction(StateClass) {
    let self = this;
    if (typeof StateClass === 'string') {
      return null;
    } else if (StateClass instanceof Array) {
      return callback => self.buildAsyncParallel(StateClass, callback);
    } else {
      // create object of the StateClass with reference to the StateManager;
      let state = new StateClass(self, self.localesManager);
      return callback => {
        if (self.pause) {
          callback({ skip: true });
        } else {
          state.execute(callback);
        }
      }
    }
  }

  buildAsyncSeries(seriesStates, offset, callback) {
    if (typeof offset === 'function') {
      callback = offset;
      offset = 0;
    }
    seriesStates = seriesStates.slice(offset);
    let self = this;
    let seriesFunctions = [];
    for (let state of seriesStates){
      let temp = self.buildAsyncFunction(state);
      if (!temp) {
        break;
      }
      seriesFunctions.push(temp);
    }
    async.series(seriesFunctions, (err, results) => {
      // clear the flag at the end of each series calls (stream)
      self.pause = false;
      if (!err || err.skip) {
        callback(err, results);
      } else {
        callback(null, results);
      }

    });
  }

  initialize(callback) {
    let self = this;
    let initialStream = self.getStream('initialize');
    self.buildAsyncSeries(initialStream, (err, results) => {
      console.log('Initialization is complete', self.data.user.fbId);
      callback(err, results);
    });
  }

  finalize(callback) {
    let self = this;
    let finalStream = self.getStream('finalize');
    self.buildAsyncSeries(finalStream, (err, results) => {
      console.log('Finalization is complete!', self.data.user.fbId);
      callback(err, results);
    });
  }

  /*
    1- check whether it is a reset state(eg. start over ),
    normal message or postback(button) and check if the input is expected or not.
  */
  checkForTextInputs() {
    let self = this;
    let stateClassToBeInjected = null;
    let {user, incomingMessage, latestValidState} = this.data;
    let isResetState = incomingMessage.extraData.stream === 'hi';
    let isFreeFormInput = incomingMessage.type === EVENT_TYPE.MESSAGE;
    let isPostBack = incomingMessage.type === EVENT_TYPE.POSTBACK;
    let isFreeFormInputExpected = (latestValidState && latestValidState.needsInputVerification) || false;
    let isPostBackExpected = (latestValidState && (latestValidState._needsPostBackProcessing || latestValidState.needsPostBackProcessing(incomingMessage))) || false;
    let isComplaining = user.complaint && typeof user.complaint !== 'undefined' && user.complaint.length > 0
  
    if (isResetState) {
      return null;
    } else if (isPostBackExpected && isPostBack) {
      stateClassToBeInjected = StateProcessPostBack;
      user.clearInvalidMessages();
    } else if (isFreeFormInputExpected && incomingMessage) {
      if (user.shouldSendToSupport()) {
        stateClassToBeInjected = StateHandleUserConfusion;
      } else {
        stateClassToBeInjected = StateVerifyInput;
      }
    } else if (isFreeFormInput && !isFreeFormInputExpected) {
      // return a state to handle random inputs
      if (user.shouldSendToSupport() || user.isWarned) {
        // user.isWarned is set when it talks to live agent
        stateClassToBeInjected = StateHandleUserConfusion;
      }
      else {
        if(isComplaining) {
          stateClassToBeInjected = StateConfirmIssue;
        } else {
          stateClassToBeInjected = StateHandleRandomInputs;
        }
      }
    } else {
      user.clearInvalidMessages();
    }
    return stateClassToBeInjected;
  }

  getStream(streamName) {
    return this.streams[streamName].slice();
  }

  /*
    Execute next state.
    1- if global switch is off then no reply for the user.
    2- else Get stream and index to know the next state.
    3- go to check for inputs to check whether it is valid or random input.
    4- 
  */
  executeNextStates(callback) {
    if (this.data.globalSwitchValue === 'off') {
      // don't reply to user
      this.setNoReply(true);
      console.log('Gobal switch offff');
      console.log('No Reply for this user!', this.data.user.fbId);
      return callback(null);
    }
    let self = this;
    let {stream, index} = self.data.nextStatePosition;
    let {user} = self.data;
    if (this.data.isFirstTime) {
      stream = 'hi';
    }
    let streamStates = self.getStream(stream);
    let stateClassToBeInjected = self.checkForTextInputs(streamStates);
    if (stateClassToBeInjected) {
      streamStates.splice(index, 0, stateClassToBeInjected);
    }
    self.buildAsyncSeries(streamStates, index, (err, results) => {
      console.log('Executed Next States!', self.data.user.fbId);
      if (!self.noReply) {
        let stateSendPromptObj = new StateSendPrompt(self);
        stateSendPromptObj.execute(callback);
      } else {
        console.log('No Reply for this user!', self.data.user.fbId);
      }
    });
  }

  start() {
    let self = this;
    console.log("starting....");
    async.series([
      seriesCallback => self.initialize(seriesCallback),
      seriesCallback => self.executeNextStates(seriesCallback),
      seriesCallback => self.finalize(seriesCallback)
    ], (err, results) => {
      if (err) {
        console.error('Error at strting', err);
      }
      console.log('Done!', self.data.user.fbId);
    });
  }

  static createManagers(rawIncomingEvent) { 
    async.waterfall([
      nextFunc => {
        let incomingMessages = fbapi.processEvents(rawIncomingEvent);

        // console.log("MESSAGES\n" + 
        // JSON.stringify(incomingMessages, null, 4) + "\n END"); 
        nextFunc(null, incomingMessages);
      }
    ], (err, incomingMessages) => {
      incomingMessages.forEach(incomingMessage => {
        let stateManager = new StateManager(_streams, { incomingMessage: incomingMessage });
        stateManager.start();
      });
    });
  }

  addPrompt(extraPrompt) {
    if (!this.prompt) {
      this.prompt = [];
    }
    if (extraPrompt instanceof Array) {
      this.prompt = this.prompt.concat(extraPrompt);
    } else {
      this.prompt.push(extraPrompt);
    }
  }

  pauseExecution(pauseFlag) {
    this.pause = pauseFlag;
  }

  clearVerificationFlags() {
    this.needsInputVerification = false;
    this.isFailure = false;
    // this.pause = false;
  }
}

module.exports.StateManager = StateManager;