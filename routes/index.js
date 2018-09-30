let express = require('express');
let bcrypt = require('bcrypt-nodejs');
let async = require('async');

let {Admin} = require('../db/models/admin');
let passport = require('../passport');

let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Hello world!');
  // res.render('index', { title: 'Express' });
});
router.get('/logout', (req, res, next) => {
  req.session.destroy(err => {
    res.redirect('/login');
  });
});
router.get('/login', (req, res, next) => {
  if (req.isAdmin) {
    res.redirect('/dashboard/summary');
  } else {
    res.render('login');
  }
});

router.post('/login', (req, res, next) => {
  if (req.isAdmin) {
    res.redirect('/dashboard/summary');
  } else {
    next();
  }
}, (req, res, next) => {
  req.checkBody('password').notEmpty();
  req.checkBody('username').notEmpty();
  req.getValidationResult().then(result => {
    req.validationResult = result;
    next();
  });
}, (req, res, next) => {
  let errors = null;
  if (!req.validationResult.isEmpty()) {
    errors = req.validationResult.array();
    res.render('login', { errors, username: req.body.username, password: req.body.password });
  } else {
    async.waterfall([
      nextFunc => Admin.findOne({username: req.body.username}, nextFunc),
      (user, nextFunc) => bcrypt.compare(req.body.password, (user && user.password) || '', (err, result) => {
        nextFunc(err, user, result);
      }),
    ], (err, user, isAdmin) => {
      if (isAdmin) {
        req.session.adminId = user.id;
        res.redirect('/dashboard/summary');
      } else {
        errors = [ { msg: 'username or password might be wrong' } ];
        res.render('login', { errors, username: req.body.username, password: req.body.password });
      }
    });
  }
});


module.exports = router;