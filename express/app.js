// Note, the includes are a mess now...
require('./helpers.js');

// Express init

var express = require('express');
app = module.exports = express.createServer();

// App Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'tlj4F6sUSfESeL9oMX0S' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.logger());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routing information
require('./controllers/route.js');

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);