const async = require('async');
const { User } = require('./db/models/user');
const { Message } = require('./db/models/message');

User.find({}).exec((err, users) => {
  async.eachLimit(users, 5, (user, done) => {
    Message.updateMany({fbId: user.fbId}, {$set: {gender: user.gender, joinedAt: user.joinedAt}}, done);
  }, err => {
    console.log('done');
    process.exit();
  });
});
