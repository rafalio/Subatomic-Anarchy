var stage;
var canvas;
var map;
var minimap;
var chat;

var ship_images   = {};
var SHIP_TYPES    = 11;          // Number of ship types

var players       = {};         // Global array to keep all the players. Indexed via username;

var planet_images = {};
var planets       = {};

var pressed1      = false;
var pressed2      = false;      // are we pressing anything?
//var pressed_obj   = null;
var me            = null;       // My player object. It resides inside 'players'

//document.onkeyup = handleKeyUp;
// Handle key presses I wasn't sure wether to add it globally, or to the player. For now the player.

// Called onload in body
function game_init(){
  canvas  = document.getElementById('canvas');
  stage   = new Stage(canvas)
  stage.enableMouseOver();
  map     = new Map(5000,5000);
  minimap = new Minimap(975,25,200,200);
  chat    = new Chat();

  loadShips(1,shipsLoaded); 
}

// Add a player to the player list. p is an object from which we instantiate a player
function addPlayer(p) {
  if(players[p.username] == undefined) {
    players[p.username] = new Player(p);
  } else {
    console.log("error occured when adding player to player list");
  }
}

function shipsLoaded(){
  Ticker.addListener(window);
  hookImagesToProfile();
  socket_init(map);              // Initialize networking with sockets
}

// Load all spacehips into memory. All the spaceships have names "spaceship#.png"
function loadShips(num,done){
  if(num > SHIP_TYPES) done();
  else{
    var s = new Image()

    s.onload = function(){
      ship_images[num] = s;
      loadShips(num+1, done);
    };
    s.src = "images/spaceship{0}.png".format(num);
  }
}


// Unloads the given player from the map.
function unloadPlayer(pname){
  var p = players[pname];
  
  // unload the graphic
  stage.removeChild(p.shipBitmap);
  stage.removeChild(p.label);
  
  // get rid of the player data
  delete players[pname];
  
  console.log(players)
}

// Called on every clock tick
function tick(){
  
  // Tick on all the players
  _.forEach(players, function(player,key) {
    player.tick();
  });
  
  map.updateFPS();  
  stage.update();
  
}
