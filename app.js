var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var AmiIo = require("ami-io"),
    amiio = AmiIo.createClient({port:5038, host:'10.60.68.1', login:'pasaia', password:'p4s414'}),
    amiio2 = new AmiIo.Client();

const notifier = require('node-notifier');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

amiio.on('incorrectServer', function () {
    amiio.logger.error("Invalid AMI welcome message. Are you sure if this is AMI?");
    process.exit();
});
amiio.on('connectionRefused', function(){
    amiio.logger.error("Connection refused.");
    process.exit();
});
amiio.on('incorrectLogin', function () {
    amiio.logger.error("Incorrect login or password.");
    process.exit();
});
amiio.on('event', function(event){
    if ( event.event === 'Dial') {
        console.log("dei berria");
        // amiio.logger.info('event:', event);
        notifier.notify({
            title: 'DEI BERRIA',
            message: 'ring ring!',
            icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
            sound: true, // Only Notification Center or Windows Toasters
            wait: true // Wait with callback, until user action is taken against notification
        }, function (err, response) {
            // Response is response from notification
        });
    }
    if ( event.event === 'Hangup') {
        console.log("Kolgatu");
        // amiio.logger.info('event:', event);
    }

});
amiio.connect();
// amiio.on('connected', function(){
//     setTimeout(function(){
//         amiio.disconnect();
//         amiio.on('disconnected', process.exit());
//     },3000);
// });




app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
