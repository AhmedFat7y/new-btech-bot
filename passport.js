let passport = require('passport');
let Strategy = require('passport-local').Strategy;
let {Admin} = require('./db/models/admin');

passport.use(new Strategy(
  function(username, password, done) {
    Admin.find({username}, (err, user) => {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (user.password !== password) { return done(null, false); }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.fbId);
});

passport.deserializeUser(function(fbId, done) {
  Admin.find({fbId}, function (err, user) {
    if (err) { return done(err); }
    done(null, user);
  });
});

module.exports = passport;
