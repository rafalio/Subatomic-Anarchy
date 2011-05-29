// Note, the includes are a mess now...
require('./helpers.js');
var sys = require('sys');

// Express init

var express = require('express');
app = module.exports = express.createServer();

var io = require('socket.io')

var connect = require('connect'),
    MemoryStore = express.session.MemoryStore;
    session_store = new MemoryStore();

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
})


// Routing information
require('./controllers/route.js');

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);


// Socket.IO

var io = io.listen(app);

io.on('connection', function(client){ 
  
  var cookie_string = client.request.headers.cookie;
  var parsed_cookies = connect.utils.parseCookie(cookie_string);
  var connect_sid = parsed_cookies['connect.sid'];
  
  if (connect_sid) {
    session_store.get(connect_sid, function (error, session) {
      console.log(sys.inspect(session));
    });
  }

  // new client is here! 
  client.on('message', function(){
    console.log("message received!");
  })
  
  client.on('disconnect', function(){
    console.log("person disconnected!");
  })
  
  
});
