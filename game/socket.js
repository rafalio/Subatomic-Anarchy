var connect = require('connect');
var io = require('socket.io');

//Chat buffer
var buffer = [];

var io      = require('socket.io');

exports.start = function(data, server, session_store) {    
  io = io.listen(server, {
    transports: ['websocket', 'htmlfile', 'xhr-multipart', 'xhr-polling','jsonp-polling']
  });
  
  io.on('connection', function(client){
  
    // Get the connection cookie
    var cookie_string = client.request.headers.cookie;
    var parsed_cookies = connect.utils.parseCookie(cookie_string);
    var connect_sid = parsed_cookies['connect.sid'];  
  
    if (connect_sid){
      session_store.get(connect_sid, function (error, session) {
        if(error){
          console.log("ERROR FETCHING SESSION!");
        }
        
        // If the user has a session set up. This would fail if site is open, node crashes,
        // and then you restart node. Socket.IO from client side would try to establish a connection,
        // but we wouldn't have been logged in as seen by the server, hence this would fail. Normally,
        // if the server is running all the time, this shouldn't happen.

        if(session && session.user){
          var uname = session.user.username;
          data.addPlayer(session.user, client);
          
          // Synchronize the client
          client.send({ 
            type:     'onNewConnect',
            me:       data.mainPlayerExtr(uname),
            everyone: data.playersExtr(uname),
            planets:  data.planetsExtr(),
            chatBuf:  buffer
          });
          
          // Tell everyone a new guy arrived
          client.broadcast({
            type: 'newArrival',
            player: data.playerExtr(uname)
          });
      
          client.on('disconnect', function(){
            data.deletePlayer(uname);

            io.broadcast({
              type:   "userDisconnected",
              pName:  uname
            });
          });
                    
          client.on('message', function(msg){
            console.log("message received!");

            switch(msg.type){  
              // Called when the player says he reached a new location!
              case 'positionUpdate':
                data.newPos(msg.pData, uname);
                //msg.username = uname;
                //client.broadcast(msg);
                break;

              /*  When a player initiates movement, pass the message on to everyone else,
                  so that animation can start. */
              case 'initMovement':
                msg.username = uname;
                client.broadcast(msg);
                break;
              
              case 'chat':
                var p = {
                  type: 'chat',
                  from: uname,
                  txt: msg.txt
                }
                
                buffer.push(p);
                
                if(buffer.length > 15) buffer.shift();
                client.broadcast(p);
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

function sendResources(client, resources) {
  client.send({
    type: "updateResources",
    res: resources
  });
}

//This get's called by data.newPos. planet has the following:
//name, resources, prices
//prices are in a general unit of something, so if
//prices = {gold: 1, deuterium: 2, food: 3}, you need 1 gold to buy 3 food
function initTrade(client, uname, planet) {
  client.send({
    type: "initTrade",
    planet: planet
  });
}

//Convention proposition: position -1,-1 means the player disappears!
function updatePos(client, uname, pData) {
  client.broadcast({
    type: 'positionUpdate',
    pData: pData,
    username: uname
  });
}

exports.sendResources = sendResources;
exports.initTrade = initTrade;
exports.updatePos = updatePos;