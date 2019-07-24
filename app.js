var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//var fs = require('fs');
//var auth = require('./system/auth');
var setting = require('./system/Setting').getInstance();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api/api');
var upload = require('./routes/upload/upload');
var account = require('./routes/account/account');
//var alive = require('./routes/alive/alive');
var access = require('./routes/access/access');
var video = require('./routes/video/video');
var slideshow = require('./routes/slideshow/slideshow');
var viewer = require('./routes/viewer/viewer');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(auth);
app.use(logger('dev'));


app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/upload', upload);
app.use('/account', account);
//app.use('/alive', alive);
app.use('/access', access);
app.use('/video', video);
app.use('/slideshow', slideshow);
app.use('/viewer', viewer);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.setIO = (io) => {
  //console.log('app.hoge');
  apiRouter.setIO(io);
}

console.log(setting.get('title'));

module.exports = app;