"use strict";
const { FB_AUTHENTICATION } = require('../../config');
const request = require('request');
const async = require('async');
// const dashbot = require('dashbot')(config.DASHBOT_API_KEY).facebook;

const EVENT_TYPE = {
  MESSAGE: 0,
  POSTBACK: 1,
  DELIVERY: 2,
  READ: 3
};

const GENDER = {
  MALE: "male",
  FEMALE: "female"
};

const SENDER_ACTION = {
  TYPING_ON: 'typing_on',
  TYPING_OFF: 'typing_off',
  SEEN: 'mark_seen'
};

const ATTACHMENT_TYPE = {
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  FILE: 'file',
  LOCATION: 'location'
};
function checkQuickReplies(message) {
  let quickReplies = message.quick_replies;
  if (quickReplies && quickReplies.length === 0) {
    message.text += '\nThe options were going to be empty. Report to the developer';
  } else if (quickReplies && quickReplies.length > 11) {
    message.quick_replies = message.quick_replies.slice(0, 11);

  }
}
//callback for async.eachseries
function sendMessage(sender, messageData, callback) {
  messageData = messageData || { text: 'The reply was going to be empty! Please screenshot and report this bug! Thanks a lot buddy.' };
  checkQuickReplies(messageData);
  let requestData = {
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: FB_AUTHENTICATION.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      recipient: { id: sender },
      message: messageData,
    }
  };
  request(requestData, (error, response) => {
    if (error) {
      console.error('Error sending message:\n', error);
      console.error('Error caused by Message: ', JSON.stringify(messageData));
    } else if (response.body.error) {
      console.error('Error: ', response.body.error);
      console.error('Error caused by Message: ', JSON.stringify(messageData));
    }
    // dashbot.logOutgoing(requestData, response.body);
    if (callback) {
      callback(null);
    }
  });
  console.log('Facebook Request:', JSON.stringify({
    sender: sender,
    message: messageData
  }));
}

function sendSenderAction(userId, action, callback) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: FB_AUTHENTICATION.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      recipient: { id: userId },
      sender_action: action
    }
  }, (error, response, body) => {
    if (error) {
      console.error('Error sending action: ', error);
    } else if (response.body.error) {
      console.error('Error: ', response.body.error);
    }
    if (callback) {
      callback();
    }
  });
}

function doSubscribeRequest() {
  request({
    method: 'POST',
    uri: 'https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=' + FB_AUTHENTICATION.PAGE_ACCESS_TOKEN
  },
    (error, response, body) => {
      if (error) {
        console.error('Error while subscription: ', error);
      } else {
        console.log('Subscription result: ', response.body);
      }
    });
}

//fbid of user, data of message, and type of message content
function createStandardizedMessageObject(sender, data, type, timestamp, extraData) {
  extraData = extraData || {};
  if(extraData.constructor.name === 'String') {
    extraData = JSON.parse(extraData);
  }
  return {
    type: type,
    sender: sender,
    text: data,
    extraData: extraData,
    timestamp: timestamp || Date.now()
  }
}

function createStandardizedAttachmentObject(type, data) {
  return {
    type: type,
    data: data
  }
}


function processEvents(data) {
  // console.log('Facebook Events received', JSON.stringify(req.body));
  // dashbot.logIncoming(req.body);
  // let data = req.body;
  let output = [];
  if (!data || !data.entry) {
    return output;
  }
  data.entry.forEach((entry) => {
    entry.messaging.forEach((messaging) => {
      let messageData = null;
      if (messaging.message) { // handle message object
        messageData = processMessageObject(messaging);
      } else if (messaging.postback || messaging.referral) { // handle postback
        messageData = processPostbackObject(messaging);
      } else {
        console.error('Unexpected Messaging Content: ', messaging);
      }
      if (messageData) {
        output.push(messageData);
        console.log('Received Message:', messageData);
      }
    });
  });
  return output;
}

// flatten the message.attachments and standardize them.
function processMessageAttachments(message) {
  return message.attachments.map((attachment) => {
    let attachmentContent = null;
    switch (attachment.type) {
      case ATTACHMENT_TYPE.VIDEO:
      case ATTACHMENT_TYPE.AUDIO:
      case ATTACHMENT_TYPE.FILE:
      case ATTACHMENT_TYPE.IMAGE:
        attachmentContent = attachment.url;
        break;
      case ATTACHMENT_TYPE.LOCATION:
        attachmentContent = attachment.payload.coordinates.lat + ',' + attachment.payload.coordinates.long;
        break;
      default:
        console.error('Unexpected Message Attachment Type: ', attachment);
    }
    return createStandardizedAttachmentObject(attachment.type, attachmentContent);
  });
}

// flatten the messaging.message content and standardize it.
function processMessageObject(messaging) {
  let message = messaging.message,
    timestamp = messaging.timestamp,
    sender = messaging.sender.id,
    messageType = EVENT_TYPE.MESSAGE,
    data = null,
    extraData = null;
  if (message.quick_reply && message.quick_reply.payload) { // if there is a quick reply payload, return it
    messageType = EVENT_TYPE.POSTBACK;
    extraData = message.quick_reply.payload;
    data = extraData.text;
  } else if (message.text) { // if there are no quick replies but there's text, return the text
    data = message.text;
  } else if (message.attachments) { // if there are attachments,  flatten them and return
    messageType = EVENT_TYPE.MESSAGE;
    extraData = JSON.stringify({ attachments: processMessageAttachments(message) });
  } else { // otherwise stop and return null
    console.error('Unexpected Message Content: ', message);
    return null;
  }
  return createStandardizedMessageObject(sender, data, messageType, timestamp, extraData);
}

//flatten the messaging.postback content and standardize it.
function processPostbackObject(messaging) {
  let postback = messaging.postback || {};
  let referral = messaging.referral;
  let sender = messaging.sender.id;
  let timestamp = messaging.timestamp;
  let data = null,
    extraData = null;
  if (postback.payload || referral) {
    extraData = Object.assign({}, JSON.parse(postback.payload), JSON.parse(referral || '{}'));
  } else {
    console.error('Unexpected Postback Content: ', postback);
    return null;
  }
  return createStandardizedMessageObject(sender, data, EVENT_TYPE.POSTBACK, timestamp, extraData);
}

function sendMessages(sender, messages, callback) {
  let lastIndex = messages.length - 1;
  async.eachOfSeries(messages, (message, index, eachOfSeries) => {
    async.series([
      (nextFunc) => {
        sendMessage(sender, message, (err) => {
          nextFunc(index === lastIndex ? { skip: true } : null);
        });
      },
      (nextFunc) => {
        sendSenderAction(sender, SENDER_ACTION.TYPING_ON, nextFunc);
      }
    ], (err) => {
      if (err && !err.skip) {
        console.error('Error on sending message then action!', err);
      }
      eachOfSeries(null);
    });
  }, err => {
    callback(err);
  });
}

function getUserInfo(userId, callback) {
  request({
    url: 'https://graph.facebook.com/v2.6/' + userId,
    qs: {
      access_token: FB_AUTHENTICATION.PAGE_ACCESS_TOKEN,
      fields: "first_name,last_name,profile_pic,locale,timezone,gender"
    },
    method: 'GET',
  }, (error, response, body) => {

    if (error) {
      console.error('Error sending action: ', error);
    } else if (response.body.error) {
      console.error('Error: ', response.body.error);
    }
    if (callback) {
      callback(null, JSON.parse(body));
    }
  });
}

function sendSeenAndTyping(sender) {
  async.eachSeries([SENDER_ACTION.SEEN, SENDER_ACTION.TYPING_ON], (senderAction) => {
    sendSenderAction(sender, senderAction);
  });
}
doSubscribeRequest();
module.exports = {
  processEvents,
  sendMessage,
  doSubscribeRequest,
  sendSenderAction,
  sendMessages,
  sendSeenAndTyping,
  getUserInfo,
  EVENT_TYPE,
  SENDER_ACTION,
  ATTACHMENT_TYPE,
  GENDER
}
