/**
 * Module dependencies.
 */
var express       = require('express');

var app           = module.exports = express.createServer();
var auth          = require('./auth.js');
var data          = require('./data.js');
var forms         = require('./models/forms.js');
var models        = require('./models/models.js');
var route         = require('./controllers/route.js');
var session_store = new express.session.MemoryStore();
var socket        = require('./socket.js');
var player        = require('./Player.js');
var planet        = require('./Planet.js');

auth.start(models.User);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ store: session_store, secret: '8033C112F253B677A437791FEBF2173A2F576836E3A' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.dynamicHelpers({
  user: function(req, res) {
    return req.user
  }
});

// Routes
route.start(app,auth,data,forms,models,player);

data.start(models, socket, planet, function(){
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
  socket.start(data, app, session_store);
});