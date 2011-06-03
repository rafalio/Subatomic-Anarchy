require('./helpers.js');
var auth = require('./auth.js')
  , data = require('./data.js')
  , express = require('express')
  , forms = require('./models/forms.js')
  , models = require('./models/models.js')
//  , route = require('./controllers/route.js')
  , session_store = new express.session.MemoryStore()
  , sys = require('sys')
  , socket = require('./socket.js');
  
app = module.exports = express.createServer();

// App Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({store: session_store, secret: 'tlj4F6sUSfESeL9oMX0S' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  //app.use(express.logger());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.dynamicHelpers({
  session: function(req, res){
    return req.session;
  }
});


// Routing information
require('./controllers/route.js');

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);

socket.start(app,session_store,data);