(function(w){
        
  Map.prototype.grid_size   = 100;
  Map.prototype.dim         = {width: 5000, height: 5000};
  Map.prototype.grid_num    = {x: 50, y: 50};
  
  
  var simple_map = {
    "betelgeuse" : {
      position: {x: 4, y : 3},
      src: "planet1.png",
      type: "whatever",
      resources: {}
    }
  }
  
  
  // Constructor
  function Map(){
    this.drawGrid();
    this.registerMapControls();
  }
  
  
  
  Map.prototype.loadMap = function(map){
    Object.keys(map).forEach(function(planet){
      map[planet]
    })
  }
  
  
  
  
  // Given an (x,y) stage pixel, snaps to nearest grid
  Map.prototype.snapToGrid = function(position){
    // Note, scaleX should always be equal to scaleY;
    var scale = stage.scaleX;
    return {
      x: Math.floor( (position.x - stage.x) / (this.grid_size*scale)),
      y: Math.floor( (position.y - stage.y) / (this.grid_size*scale))
    }
  }
  
  // Converts a grid positition (ie (3,5) ), to a stage coordinate position in pixels.
  // Places it in the center of the grid.
  Map.prototype.gridToStage = function(pos){
    return {
      x: (pos.x + 0.5)*this.grid_size,
      y: (pos.y + 0.5)*this.grid_size
    }
  }
  
  Map.prototype.registerMapControls = function(){    
    var scroll_listener;
    
    canvas.addEventListener("mousedown", function(evt){
      var off_x = evt.offsetX;
      var off_y = evt.offsetY;
    
      var st = {
        x: stage.x,
        y: stage.y
      }
    
      scroll_listener = function(e){
    
        var newCoords = {
          x: st.x - (off_x - e.offsetX),
          y: st.y - (off_y - e.offsetY)
        }
    
        //TODO: Add checking for out-of-bounds on the other end
        // That's a function of grid_size, map dimensions, and canvas size.
        if(newCoords.x < 0){
          stage.x = newCoords.x;
        }
        if(newCoords.y < 0){
          stage.y = newCoords.y;
        }
    
      }
      document.addEventListener("mousemove", scroll_listener); 
    })
    
    document.addEventListener("mouseup", function(evt){
      document.removeEventListener("mousemove",scroll_listener);
    }) 
  }

  Map.prototype.drawGrid = function(){
    var g = new Shape();
    stage.addChild(g);

  	var color = Graphics.getRGB(0xFF,0xFF,0xFF,0.2)

  	// Vertical lines
  	for(var i = 0; i < this.dim.width; i += this.grid_size ){
  	  g.graphics.beginStroke(color).moveTo(i,0).lineTo(i, this.dim.height).endStroke();
  	}
  	// Horizontal lines
  	for(var i = 0; i < this.dim.height; i += this.grid_size ){
  	  g.graphics.beginStroke(color).moveTo(0,i).lineTo(this.dim.width,i).endStroke();
  	}

    g.cache(0,0,this.dim.width,this.dim.height);

    labels = new Container();

    for(var i = 0; i < this.grid_num.x; i++){
      for(var j = 0; j < this.grid_num.y; j++){
        var txt   = new Text("({0},{1})".format(i,j), "12px Arial", Graphics.getRGB(0xFF,0xFF,0xFF,0.7));
        txt.x = i * this.grid_size + this.grid_size/2;
        txt.y = j * this.grid_size + this.grid_size/2;
        labels.addChild(txt);
      }
    }

    labels.cache(0,0,this.dim.width,this.dim.height);
    stage.addChild(labels);
  }
  
  // Register for everyone
  w.Map = Map;
  
})(window);