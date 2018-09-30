const mongoose = require('mongoose');
const {BOT_DB} = require('../config');
const autoIncrement = require('mongoose-auto-increment')
let isConnectCalled = false;
let singletonMongoose = null;
let options = {
  promiseLibrary: global.Promise,
  uri_decode_auth: true
};
module.exports = {
  connect() {
    // console.log('Environment Variables:', process.env);
    if (isConnectCalled) {
      return singletonMongoose;
    }
    let authentication = ``;
    if (BOT_DB.USER) {
      authentication = `${BOT_DB.USER}:${BOT_DB.PASSWORD.replace('@', '%40')}@`;
    }
    let connectionString = `mongodb://${authentication}${BOT_DB.HOST}:${BOT_DB.PORT}/${BOT_DB.NAME}`;
    let connection = mongoose.connect(connectionString, options);
    autoIncrement.initialize(connection);
    console.log('Connection String:', connectionString);
    mongoose.set('debug', true);
    mongoose.connection
      .on('connected', ref => {
        console.info('Connected To MongoDB!');
      })
      .on('error', err => {
        console.error('Couldnt Connect to MongoDB!', err);
      })
      .on('disconnected', () => {
        console.warn('Disconnected from MongoDB!');
      });
    isConnectCalled = true;
    singletonMongoose = mongoose;
    return mongoose;
  }
};
