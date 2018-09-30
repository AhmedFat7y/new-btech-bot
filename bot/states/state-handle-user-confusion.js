"use strict";
const nodemailer = require('nodemailer');

const config = require('../../config');
const StateBase = require('./state-base');
const STATE_NAME = 'StateConfusionHandle';

class StateHandleUserConfusion extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
    this.needsInputVerification = true;
  }

  constructReply() {
    const self = this;
    return {
      text: self.localesManager.phrases.confusionHandle,
    };
  }


  execute(callback) {
    console.log('Executing State confusion handle');
    this.skipPrompt = false;
    this.stateManager.setIsFailure(true);
    let {user} = this.stateManager.data;
    if (!user.isWarned) {
      this.prompt(callback);
      user.setIsWarned();
    } else {
      this.prompt(callback);
      this.stateManager.setNoReply(true);
    }
    // let transporter = nodemailer.createTransport({
    //   service: 'Gmail',
    //   auth: {
    //     user: config.SUPPORT.FROM_EMAIL_ID, // Your email id
    //     pass: config.SUPPORT.FROM_EMAIL_PASSWORD // Your password
    //   }
    // });
    // let mailOptions = {
    //   from: config.SUPPORT.FROM_EMAIL_ID, // sender address
    //   to: config.SUPPORT.TO_EMAILS, // list of receivers
    //   subject: 'Bibo User Issue', // Subject line
    //   // text: text //, // plaintext body
    //   html: '<b>Hello world ✔</b> Emails are sent successfully after 3 errornous messages' // You can choose to send an HTML body instead
    // };
    // transporter.sendMail(mailOptions, function(error, info){
    //   if(error){
    //     console.log('Error Sending Email:', error);
    //   }else{
    //     console.log('Message sent: ' + info.response);
    //   };
    // });

  }

  prompt(callback) {
    this.managePrompts(this.constructReply(), callback);
  }
}
module.exports = StateHandleUserConfusion;
