var connect = require('connect');
var io = require('socket.io');

//Chat buffer
var buffer = [];

exports.start = function(data, server, session_store) {    
  io = io.listen(server, {
    transports: ['websocket', 'htmlfile', 'xhr-multipart', 'xhr-polling','jsonp-polling']
  });
  
  io.on('connection', function(client){
  
    // Get the connection cookie

    if(client.request){
      var cookie_string = client.request.headers.cookie;
      var parsed_cookies = connect.utils.parseCookie(cookie_string);
      var connect_sid = parsed_cookies['connect.sid'];  
    } else return;

        if (connect_sid){
      session_store.get(connect_sid, function (error, session) {
        if(error){
          console.log("ERROR FETCHING SESSION!");
        }
        
        // If the user has a session set up. This would fail if site is open, node crashes,
        // and then you restart node. Socket.IO from client side would try to establish a connection,
        // but we wouldn't have been logged in as seen by the server, hence this would fail. Normally,
        // if the server is running all the time, this shouldn't happen.

        if(session && session.username){
          var user = data.users[session.username]
          var uname = user.getName();
          data.addPlayer(user, client, buffer);
      
          client.on('disconnect', function(){
            io.broadcast({
              type:   "userDisconnected",
              pName:  session.username
            });
            data.deletePlayer(uname);
          });
                    
          client.on('message', function(msg){
            console.log("message received! msg type: " + msg.type);

            switch(msg.type){  
              // Called when the player says he reached a new location!
              case 'positionUpdate':
                data.newPos(msg.pData, uname);
                break;

              /*  When a player initiates movement, pass the message on to everyone else,
                  so that animation can start. */
              case 'initMovement':
                if(data.canMove(uname)) {
                  msg.username = uname;
                  client.broadcast(msg);
                }
                break;
              
             case 'chat':
                var p = {
                  type: 'chat',
                  from: uname,
                  txt: msg.txt
                }
                if(p.txt.length > 0) {
                  buffer.push(p);
                  if(buffer.length > 15) buffer.shift();
                  client.broadcast(p);
                }
                break;
                    
              case 'trade':
                data.doTrade(msg, uname);
                break;
              
              case 'endTrade':
                data.endTrade(uname);
                break;
                
              case 'shipUpdate':
                data.shipUpdate(msg, uname);
                break;
            }
          });
        }
      });  
    } else {
      //Massive Error
    }
  });
}
