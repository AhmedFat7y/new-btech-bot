require('dotenv').config();
const {FB_AUTHENTICATION} = require('./config');
const request = require('request');
const async = require('async');

function makeRequest(data, callback) {
  request({
    method: 'POST',
    url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: {
      access_token: FB_AUTHENTICATION.PAGE_ACCESS_TOKEN
    },
    json: data
  }, (err, res, body) => {
    console.log(body);
    if (callback) {
      callback(err, res, body);
    }
  });
}

function setMenu(callback) {
  makeRequest({
    "persistent_menu": [
      {
        "locale": "default",
        "composer_input_disabled": false,
        "call_to_actions": [
          {
            "title": "Start Over",
            "type": "postback",
            "payload": JSON.stringify({
              stream: 'hi',
              index: 0,
              resetInvalidMsgs: true
            })
          },
          {
            "title": "Talk To Live Agent",
            "type": "postback",
            "payload": JSON.stringify({
              stream: 'handleUserConfusion',
              index: 0,
            })
          },
          {
            "title": "Options",
            "type": "nested",
            "call_to_actions": [
              {
                "title": "Toggle Language",
                "type": "postback",
                "payload": JSON.stringify({
                  stream: 'changeLanguage',
                  index: 0
                })
              },
              {
                "title": "Report an Issue",
                "type": "postback",
                "payload": JSON.stringify({
                  stream: 'reportIssue',
                  index: 0
                })
              },
              {
                "title": "Go to B.TECH",
                "type": "web_url",
                "url": "https://www.example.com/?source=bibo&platform=messenger",
                "webview_height_ratio": "full"
              }
            ]
          },
        ]
      }
    ]
  }, callback);
}


function setWelcomeText(callback) {
  makeRequest({
    "greeting": [
      {
        "locale": "default",
        "text": "يا هلا و يا غلا بالحبايب! يلا بينا؟"
      }, {
        "locale": "en_US",
        "text": "YOO! Let's Begin?!"
      }
    ]
  }, callback);
}
function setGetStartedButton(callback) {
  makeRequest({
    "get_started": {
      "payload": JSON.stringify({
        stream: 'hi',
        index: 0,
      })
    }
  }, callback);
}
async.series([
  setWelcomeText,
  setGetStartedButton,
  setMenu,
], err => {
  process.exit(0);
});