let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let expressSession = require('express-session');
let expressValidator = require('express-validator');

let passport = require('./passport');
let db = require('./db/connector');
let indexRoutes = require('./routes/index');
let usersRoutes = require('./routes/users');
let webhookRoutes = require('./routes/webhook');
let dashboardRoutes = require('./routes/dashboard');
let { Admin } = require('./db/models/admin');
const config = require('./config');
let MongoStore = require('connect-mongo')(expressSession);
let mongoose = require('mongoose');


let app = express();
//define global variable with app's root directory 

// global.appRoot = path.resolve(__dirname); 

let dbConnection = db.connect();

// view engine setup
app.set('views', path.join(__dirname, 'dashboard/views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// this line must be immediately after any of the bodyParser middlewares!
app.use(expressValidator());

// To be revistited

// Basic usage

app.use(cookieParser());
app.use(expressSession({
  secret: config.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
  store: new MongoStore({ mongooseConnection: dbConnection.connection })
  // store: new MongoStore({
  //   host: '127.0.0.1',
  //   port: 27017,
  //   url: 'mongodb://localhost:27017/btech-bot'
  // })
}));


// Basic usage
// app.use(expressSession({
//   store: new MongoStore({
//     // db: 'btech-bot',
//     host: '127.0.0.1',
//     port: 27017,
//     url: 'mongodb://localhost:27017/btech-bot'
//     // mongooseConnection: mongoose.connection,
//     // collection: 'session'
//   })
// }));

// mongoose.connect();

app.use(require('stylus').middleware(path.join(__dirname, 'dashboard/public')));
app.use(express.static(path.join(__dirname, 'dashboard/public/')));

// Initialize Passport and restore authentication state, if any, from the
// session.
// app.use(passport.initialize());
// app.use(passport.session());

app.use('/', indexRoutes);
app.use('/users', usersRoutes);
app.use('/webhook', webhookRoutes);

if (app.get('env') !== 'development') {
  console.log('=> Activate Authentication');
  app.use((req, res, next) => {
    console.log('DASHBOARD session admin id', req.session.adminId);
    if (!req.session.adminId) {
      return res.send('You are not allowed here!')
    }
    Admin.findById(req.session.adminId, (err, user) => {
      if(!err && user) {
        req.isAdmin = true;
        next();
      } else {
        return res.send('You are not allowed here!');
      }
    });
  });
}
app.use('/dashboard', dashboardRoutes);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;
  err.status !== 404 && console.error('Server Error:', res.locals.error);
  // render the error page
  // res.status(err.status || 500);
  // res.render('error');
  res.send(err);
});
module.exports = app;
