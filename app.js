var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require('cors');
var routes = require('./routes/routes');

// 스케줄링 모듈
var schedule = require('node-schedule');

// 스케줄링 정보
var scheduleinfo = require('./module/scheduleinfo');

// helmet
var helmet = require('helmet');
// 매일 23시59분30초에 스케줄링
var j = schedule.scheduleJob('30 59 23 * * *', function(){
  console.log("scheduling start!");
  scheduleinfo.initscore();
  scheduleinfo.contentsscore();
  console.log("scheduling finish!");
});

var app = express();
var bodyParser = require('body-parser');

// 파일 용량
//app.use(express.limit('20mb'));

//helmet
app.use(helmet());

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', routes);

// error handler
require('./errorhandler')(app);

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
