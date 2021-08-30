const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })
const expressValidator = require('express-validator');
const mongo = require('mongodb');
const db = require('monk')("mongodb+srv://midxdle:fFbE2DpWoxmGTAXF@cluster0.axsj3.mongodb.net/nodeblog?retryWrites=true&w=majority");
const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const detailsRouter = require('./routes/details');

const app = express();

app.locals.moment = require('moment');

app.locals.truncateText = function(text, length) {
  let truncatedText = text.substring(0, length);
  return truncatedText;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized : true,
  resave : true
}));

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param , msg, value) {
    let namesapce = param.split('.')
    , root = namesapce.shift()
    , formParam = root;

    while(namesapce.length) {
      formParam += '[' + namesapce.shift() + ']';
    }
    return {
      param : formParam,
      msg : msg,
      value : value
    };
  }
}));

// Connect-Flash
app.use(require('connect-flash')());
app.use(function(req, res , next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Make our db accessible to our router
app.use(function(req, res, next) {
  req.db = db;
  next();
});

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/details', detailsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
