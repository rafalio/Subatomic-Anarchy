// Note, the includes are a mess now...
require('./helpers.js');

var express = require('express'),
    io = require('socket.io'),
    session_store = new express.session.MemoryStore();

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
})


// Routing information
require('./controllers/route.js');

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);


// Socket.IO

var io = io.listen(app, {
  transports: ['websocket', 'htmlfile', 'xhr-multipart', 'xhr-polling','jsonp-polling']
});

// Array to keep players. Synchronizes with client side
var players = {};

io.on('connection', function(client){ 
  
  console.log("lol wat");
  
  var cookie_string = client.request.headers.cookie;
  var parsed_cookies = express.utils.parseCookie(cookie_string);
  var connect_sid = parsed_cookies['connect.sid'];  
  
  if (connect_sid) {
    session_store.get(connect_sid, function (error, session) {
      if(error){
        console.log("ERROR FETCHING SESSION!");
      }
      
      //console.log(players);
      
      var u = session.user.username;
      
      // Add current player to playing users.
      if(!players[u])
        players[u] = session.user;
      
      console.log(players);
      
      // Synchronize the client
      
      client.send(
          { 
            type:     'onNewConnect',
            me:       session.user,
            everyone: players
          }
      );
      
      
      // Tell everyone a new guy arrived
      client.broadcast({
        type: 'newArrival',
        player: players[u]
      })
      
    });
  }
  
  client.on('message', function(msg){
    console.log("message received!");
    
    switch(msg.type){
      case 'playerUpdate':
        updatePlayerArray(msg);
        client.broadcast(msg);
        break;
    }
    
  })
  
  client.on('disconnect', function(){
    console.log("person disconnected!");
  })
  
});

function updatePlayerArray(msg){
  var p = players[msg.name];
  p.position = msg.pos;
  p.rotation = msg.rot;
}
