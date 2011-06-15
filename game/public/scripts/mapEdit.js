var stage;
var canvas;
var map;
var minimap;
var planetsn = 9;
var planet_images = {};
var planet_simages = {};
var planet_models = {};

var planets = {};
var pindex = 0;

var tplanet;
var nplanet = {x: -1, y: -1};
var selstate = 3;
var text = {};
var label;

var rot = 0;

// Called onload in body
function init(){
  canvas  = document.getElementById("canvas");
	stage   = new Stage(canvas);
  map     = new Map(5000,5000);
  minimap = new Minimap(975, 25, 200, 200);
  
  canvas.onclick = onClick;
  canvas.onmousemove = onMove;
  
  //map.loadMap(simplemap, function() { planetsLoaded(planets); });
  
  label = new Text("","bold 16px Arial","#FFF");
  label.textAlign = "right";
  
  text[0] = document.getElementById("pname");
  text[0].value = "Name";
  text[1] = document.getElementById("pkind");
  text[1].value = "Type";
  text[2] = document.getElementById("pdeut");
  text[2].value = "0";
  text[3] = document.getElementById("pfood");
  text[3].value = "0";
  text[4] = document.getElementById("pgold");
  text[4].value = "0";
  
  for(i = 0; i < 5; i++){
    text[i].style.left = "-1000px";
    text[i].style.top = "-1000px";
    text[i].style.width = "96px";
  }
  
  Ticker.addListener(window);
  
  loadPlanetModels();
}

// Called on every clock tick
function tick(){
  //rot = (rot + Math.PI/180)%(2*Math.PI);
  editBoxesPos();
  //modelsPos();
  map.updateFPS();
  stage.update();
}

function onClick(){
  // Move selected planet
  if(tplanet != undefined && selstate == 1){
    var pt = map.snapToGrid({x: stage.mouseX, y: stage.mouseY});
    tplanet.position.x = pt.x;
    tplanet.position.y = pt.y;
    tplanet.syncBitmap();
    minimap.redraw();
    modelsPos();
    editBoxesPos();
  }
  // "Select" an empty grid position
  else if(selstate == 0){
    var prev = nplanet;
    nplanet = map.snapToGrid({x: stage.mouseX, y: stage.mouseY});
    if(prev.x == nplanet.x && prev.y == nplanet.y) selstate = 3;
    modelsPos();
    editBoxesPos();
  }
  // Helpers/Workarounds TODO: Look for a cleaner way to do this
  else if(selstate == 2){
    tplanet.planetBitmap.scaleX = tplanet.planetBitmap.scaleY = tplanet.planetBitmap.scale*1.2;
    selstate = 1;
  }
  else if(selstate == 3){
    selstate = 0;
    modelsPos();
  }
}

function onMove(){
  // "Cursor" Thingy
  if(selstate == 3){
    nplanet = map.snapToGrid({x: stage.mouseX, y: stage.mouseY});
    modelsPos();
  }
}

// Load small planet images
function loadPlanetModels(){
  for(i = 0; i < planetsn; i++){
    var nsrc = "planet" + (i+1) + ".png";
    var lsrc = "images/planets/planet" + (i+1) + ".png";
    var ssrc = "images/smalls/planet" + (i+1) + ".png";
    
    planet_images[nsrc] = new Image();
    planet_simages[nsrc] = new Image();
    
    planet_images[nsrc].src = lsrc;
    planet_simages[nsrc].src = ssrc;
    
    planet_simages[nsrc].onload = setPlanetModel(i);
   }
}

// Setup bitmaps for small planets
function setPlanetModel(i){
  var src = "planet" + (i+1) + ".png";
  planet_models[src] = new Bitmap(planet_simages[src]);
  planet_models[src].regX = planet_simages[src].width/2;
  planet_models[src].regY = planet_simages[src].height/2;
  planet_models[src].onClick = function(e){
    // Change source of an existing planet
    if(tplanet != undefined){
      tplanet.src = "planet" + (i+1) + ".png";
      stage.removeChild(tplanet.planetBitmap);
      tplanet.initBitmap();
      var p = {};
      p[tplanet.name] = tplanet;
      planetsLoaded(p);
      selstate = 2;
      modelsPos();
    }
    // Create a new planet
    else if(selstate == 0 && nplanet.x > -1 && nplanet.y > -1){
      while(planets["planet" + pindex] != null) pindex++;
      console.log(nplanet.x + "," + nplanet.y);
      tplanet = new Planet( {
                              name: "planet" + pindex,
                              position: {
                                x: nplanet.x,
                                y: nplanet.y
                              },
                              kind: "type",
                              resources: {
                                deuterium: 0,
                                gold: 0,
                                food: 0,
                              },
                              src: "planet" + (i+1) + ".png"
                            });
      planets[tplanet.name] = tplanet;
      var p = {};
      p[tplanet.name] = tplanet;
      planetsLoaded(p);
      selstate = 2;
      editBoxesGetData(tplanet);
      modelsPos();
    }
  }
  planet_models[src].x = -1000;
  planet_models[src].y = -1000;
  stage.addChild(planet_models[src]);
}

// Load planets and link mousevents for editing
function planetsLoaded(ps){
  Object.keys(ps).forEach(function(i){
    (function(target) {
		  ps[i].planetBitmap.onPress = function(evt) {
		    // Select and edit a planet's info
        if(tplanet != ps[i] || selstate == 0)
        {
          // Save previous planet
          if(tplanet != undefined){
            tplanet.planetBitmap.scaleX = tplanet.planetBitmap.scaleY = tplanet.planetBitmap.scale;
            editBoxesSetData();
          }
          tplanet = ps[i];
          
          selstate = 1;
          target.scaleX = target.scaleY = target.scale*1.2;
          
          editBoxesPos();
          modelsPos();
          editBoxesGetData(ps[i]);
        }
        // Deselect and save planet info
        else if(selstate == 1)
        {
          editBoxesSetData();
          tplanet = undefined;
          selstate = 0;
          target.scaleX = target.scaleY = target.scale;
        }
		  }
		})(ps[i].planetBitmap);
  });
  minimap.redraw(); // Update minimap
  stage.addChild(label);
}

// Planet palette cursor thing
function modelsPos(){
  // fixed position, existing planet
  if(tplanet != undefined)
  {
    for(i = 0; i < planetsn; i++){
      var src = "planet" + (i+1) + ".png";
      planet_models[src].x = Math.round(tplanet.planetBitmap.x-16 + 64*Math.cos(i*2*Math.PI/9));
      planet_models[src].y = Math.round(tplanet.planetBitmap.y-16 + 64*Math.sin(i*2*Math.PI/9));
      if(tplanet.src == src) planet_models[src].alpha = 1;
      else                   planet_models[src].alpha = 0.25;
      planet_models[src].scaleX = planet_models[src].scaleY = 1;
    }
  }
  // empty location, selstate 0: fixed location
  //                 selstate 3: following mouse position (see onMove)
  else if(nplanet.x != -1 && nplanet.y != -1){
    for(i = 0; i < planetsn; i++){
      var src = "planet" + (i+1) + ".png";
      var r = 24 + (selstate == 3 ? 0 : 40);
      var pt = map.gridToStage(nplanet);
      planet_models[src].x = Math.round(pt.x-(selstate == 3 ? 8 : 16) + r*Math.cos(i*2*Math.PI/9 + (selstate == 3 ? rot : 0)));
      planet_models[src].y = Math.round(pt.y-(selstate == 3 ? 8 : 16) + r*Math.sin(i*2*Math.PI/9 + (selstate == 3 ? rot : 0)));
      planet_models[src].alpha = 0.5;
      planet_models[src].scaleX = planet_models[src].scaleY = (selstate == 3? 0.5 : 1);
    }
  }
  // Hide
  else
  {
    for(i = 0; i < planetsn; i++){
      var src = "planet" + (i+1) + ".png";
      planet_models[src].x = -1000;
      planet_models[src].y = -1000;
    }
  }
}

// Textboxes with planet info
function editBoxesPos(){
  // Dynamic labelling
  if(tplanet != undefined){
    var k = -1;
    switch(document.activeElement.id)
    {
      case "pname" : k = 0; label.text = "Planet Name:"; break;
      case "pkind" : k = 1; label.text = "Planet Type:"; break;
      case "pdeut" : k = 2; label.text = "Deuterium:"; break;
      case "pfood" : k = 3; label.text = "Food:"; break;
      case "pgold" : k = 4; label.text = "Gold:"; break;
      default: label.text = "";
    }
    
    // Funky positioning
    var pt = findPos(canvas);
    for(i = 0; i < 5; i++){
      text[i].style.left = Math.round(stage.x + tplanet.planetBitmap.x + pt[0] + ((k==i)*96) +96*Math.cos(i*Math.PI/8 - Math.PI/4)) + "px";
      text[i].style.top = Math.round(stage.y + tplanet.planetBitmap.y - 12 + pt[1] + 96*Math.sin(i*Math.PI/8 - Math.PI/4)) + "px";
      if(k == i){
        label.x = tplanet.planetBitmap.x + 90 + 96*Math.cos(i*Math.PI/8 - Math.PI/4);
        label.y = tplanet.planetBitmap.y + 6 + 96*Math.sin(i*Math.PI/8 - Math.PI/4);
      }
      //text[i].style.width = text[i].value.width() + "px"; // Dynamic Width?
    }
  }
  // Hide when not needed
  else{
    label.text = "";
    for(i = 0; i < 5; i++){
      text[i].style.left = "-1000px";
      text[i].style.top = "-1000px";
    }
  }
}

// Load planet info into text boxes
function editBoxesGetData(planet){
  text[0].value = planet.name;
  //text[0].style.width = text[0].value.width() + "px";
  text[1].value = planet.kind;
  //text[1].style.width = text[1].value.width() + "px";
  text[2].value = planet.resources.deuterium;
  //text[2].style.width = text[2].value.width() + "px";
  text[3].value = planet.resources.food
  //text[3].style.width = text[3].value.width() + "px";
  text[4].value = planet.resources.gold;
  //text[4].style.width = text[4].value.width() + "px";
}

// Save planet info from text boxes
function editBoxesSetData(){
  if(tplanet != undefined){
    tplanet.name = text[0].value;
    tplanet.kind = text[1].value;
    tplanet.resources.deuterium = parseInt(text[2].value);
    tplanet.resources.food = parseInt(text[3].value);
    tplanet.resources.gold = parseInt(text[4].value);
  }
}

// Helper function to find precise global location
function findPos(obj){
	var curleft = curtop = 0;
	if (obj.offsetParent) {
	  do {
	  	curleft += obj.offsetLeft;
	  	curtop += obj.offsetTop;
	  	} while (obj = obj.offsetParent);
	}
	return [curleft,curtop];
}

// Helper function to calculate string width
String.prototype.width = function(font) {
  var f = font || '13px arial',
      o = $('<div>' + this + '</div>')
            .css({'position': 'absolute', 'float': 'left', 'visibility': 'hidden', 'font': f})
            .appendTo($('body')),
      w = o.width();

  o.remove();

  return w+2;
}
