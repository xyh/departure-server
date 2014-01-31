var express = require('express')
  , http = require('http')
  , path = require('path');

var agencies = require('./routes/agencies');
var routes = require('./routes/routes');
var stops = require('./routes/stops');

var app = express();

//CORS middleware
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', config.allowedDomains);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
}

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(allowCrossDomain);
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

app.get('/', function(req, res, next) {
  res.end("Hello, this is rest api service.");
});

app.get('/agencies', agencies.findAll);
app.get('/agencies/:id', agencies.findById);

app.get('/routes', routes.findAll);
app.get('/routes/:id', routes.findById);

app.get('/stops', stops.findAll);
app.get('/stops/:id', stops.findById);

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});