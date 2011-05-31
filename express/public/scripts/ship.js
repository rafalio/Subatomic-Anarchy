socket = new io.Socket(null, {port: 3000, rememberTransport: false});
socket.connect();

var socket_events = {
  'connect' : connectHandler
 ,'disconnect' : disconnectHandler
 ,'reconnect' : reconnectHandler
 ,'reconnecting' : reconnectingHandler
 ,'reconnect_failed' : reconnect_failedHandler
 ,'message' : messageHandler
}
 
Object.keys(socket_events).forEach( function(event, index, arr){
  var f = socket_events[event];
  if(!f) console.log("Cannot find " + fname + 'function. Please create it!' );
  else socket.on(event,f);
})

function connectHandler(){
  console.log("i've connected!!");
}

function disconnectHandler(){
  console.log("disconnected :(");
}

function reconnectHandler(){
  
}

function reconnectingHandler(nextRetry){
  
}

function reconnect_failedHandler(){
  
}

function messageHandler(msg){
  
  console.log("message received: " + msg);
  
  // Only to be called whenever we connect as a new client
  if(msg.type == 'onNewConnect'){        
    // Synchronize everyone
    players = msg.everyone;
    me = msg.me.username;  // who am i ?
    
    init();   // Entry point to EaselJS
  }
  
  // A challenger appears!
  else if(msg.type == 'newArrival'){
    console.log(msg);
    players[msg.player.username] = msg.player;
    registerUser(msg.player.username);
  }
  
  // Challenger changes position!
  else if(msg.type == 'playerUpdate'){
    console.log("hurray, server notified us!");
    var p = players[msg.name];
    p.position = msg.pos;
    p.rotation = msg.rot
    synchronizePlayer(p)
  }
    
}

// Pre:   Players array initialized with player data
// Post:  Each entry in the player array is expanded with a bitmap and txt for EaselJS

function assocForEach(obj,fn){
  Object.keys(obj).forEach(fn);
}

function onImageLoadInit(img){
  w = img.width;
  h = img.height;
  
  assocForEach(players, function(name){
    registerUser(name)
  })
  
  synchronizePlayers();
}


// Creates the ship (using img), and the message text.

function registerUser(name){
  
  var p = players[name];
  
  p.shipBitmap = new Bitmap(ship);
  
  p.shipBitmap.regX = w / 2;
  p.shipBitmap.regY = h / 2;
  
  p.shipBitmap.rotation = p.rotation;
  
  p.mapTxt    = new Text(p.username, "12px Arial", "#FFF");
  p.mapTxt.x  = p.shipBitmap.x
  p.mapTxt.y  = p.shipBitmap.y - 70;
  
  stage.addChild(p.shipBitmap);
  stage.addChild(p.mapTxt);
  
}

// Synchronizes the players positions and the bitmap being drawn
function synchronizePlayers(){
  assocForEach(players, function(element){
    var p = players[element];
    synchronizePlayer(p);
  })
}

// Synchronizes the ship/text with the position/rotation of the player.
function synchronizePlayer(p){
  p.shipBitmap.x = p.position.x;
  p.shipBitmap.y = p.position.y;
  p.shipBitmap.rotation = p.rotation;
  p.mapTxt.x = p.position.x;
  p.mapTxt.y = p.position.y - 70;
}


// Notify the server that my own position changed

function notifyServer(){
  //console.log(players[me]);
  
  socket.send({
    type: 'playerUpdate',
    name: players[me].username,
    pos:   players[me].position,
    rot:  players[me].rotation
  })
}

var ship, ctx, bitmap, txt

stage = null;

// Array to keep all the players and their positions
// Additionaly, extend everything to have  Bitmap and txt

var players = [];
var me; // don't touch


function tick() {
    stage.update();
}

function init() {
    
    canvas = document.getElementById('canvas');
    stage = new Stage(canvas)

    ship = new Image();

    ship.onload = function() {
      
        onImageLoadInit(ship);

        document.addEventListener("keydown", function(e) {
            
            var d = 20;
            var rot = 7;
            
            var bitmap = players[me].shipBitmap;
            var txt = players[me].mapTxt;
            var p = players[me];
            
            switch (e.keyCode) {
              case KEY['ARROW_RIGHT']:
                  e.preventDefault();
                  p.rotation += rot;
                  synchronizePlayer(p);
                  break;
              case KEY['ARROW_LEFT']:
                  e.preventDefault();
                  p.rotation -= rot;
                  synchronizePlayer(p);
                  
                  break;
              case KEY['ARROW_UP']:
                  e.preventDefault();
                  var r = p.rotation;
                  p.position.x += Math.cos(r * Math.PI / 180) * d;
                  p.position.y += Math.sin(r * Math.PI / 180) * d;
                  synchronizePlayer(p);
                  break;
              case KEY['ARROW_DOWN']:
                e.preventDefault();
            }
            
            notifyServer();
             
        }, true);

    }

    ship.src = "images/spaceship.png";
    Ticker.addListener(window);
    
}



// Random crap

var KEY = {
    'BACKSPACE': 8,
    'TAB': 9,
    'NUM_PAD_CLEAR': 12,
    'ENTER': 13,
    'SHIFT': 16,
    'CTRL': 17,
    'ALT': 18,
    'PAUSE': 19,
    'CAPS_LOCK': 20,
    'ESCAPE': 27,
    'SPACEBAR': 32,
    'PAGE_UP': 33,
    'PAGE_DOWN': 34,
    'END': 35,
    'HOME': 36,
    'ARROW_LEFT': 37,
    'ARROW_UP': 38,
    'ARROW_RIGHT': 39,
    'ARROW_DOWN': 40,
    'PRINT_SCREEN': 44,
    'INSERT': 45,
    'DELETE': 46,
    'SEMICOLON': 59,
    'WINDOWS_LEFT': 91,
    'WINDOWS_RIGHT': 92,
    'SELECT': 93,
    'NUM_PAD_ASTERISK': 106,
    'NUM_PAD_PLUS_SIGN': 107,
    'NUM_PAD_HYPHEN-MINUS': 109,
    'NUM_PAD_FULL_STOP': 110,
    'NUM_PAD_SOLIDUS': 111,
    'NUM_LOCK': 144,
    'SCROLL_LOCK': 145,
    'EQUALS_SIGN': 187,
    'COMMA': 188,
    'HYPHEN-MINUS': 189,
    'FULL_STOP': 190,
    'SOLIDUS': 191,
    'GRAVE_ACCENT': 192,
    'LEFT_SQUARE_BRACKET': 219,
    'REVERSE_SOLIDUS': 220,
    'RIGHT_SQUARE_BRACKET': 221,
    'APOSTROPHE': 222
};

 (function() {
    /* 0 - 9 */
    for (var i = 48; i <= 57; i++) {
        KEY['' + (i - 48)] = i;
    }
    /* A - Z */
    for (i = 65; i <= 90; i++) {
        KEY['' + String.fromCharCode(i)] = i;
    }
    /* NUM_PAD_0 - NUM_PAD_9 */
    for (i = 96; i <= 105; i++) {
        KEY['NUM_PAD_' + (i - 96)] = i;
    }
    /* F1 - F12 */
    for (i = 112; i <= 123; i++) {
        KEY['F' + (i - 112 + 1)] = i;
    }
})();

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};