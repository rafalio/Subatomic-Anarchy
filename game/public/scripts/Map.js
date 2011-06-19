(function(w){
        
  Map.prototype.grid_size   = 100;
  Map.prototype.dim         = {width: 5000, height: 5000};
  Map.prototype.grid_num    = {x: 50, y: 50};
  Map.prototype.dragged     = false;
  
  // Constructor
  function Map(w, h){
    this.dim.width = w;
    this.dim.height = h;
    this.grid_num.x = w/this.grid_size;
    this.grid_num.y = w/this.grid_size;
    this.drawGrid();
    
    this.fpsLabel = "";
        
    this.drawFPS();
    this.registerMapControls();
  }  
  
  Map.prototype.loadPlanetImages = function(map, done){
    var sources = [];
    
    console.log(map);
    _.forEach(map, function(p, key) {
      sources.push(p.src);
    });
    
    sources = _.uniq(sources);  
    
    var l = sources.length;

    (function(num){
      var ptr = arguments.callee;
      
      if(num >= l) done();
      
      else{
        var s = new Image();
        s.onload = function(){
          planet_images[sources[num]] = s;
          ptr(num+1);
        }
        s.src = 'images/planets/{0}'.format(sources[num]);
      }
    })(0); 
  }
  
  Map.prototype.loadMap = function(map, done){
    this.loadPlanetImages(map, function(){
      _.forEach(map, function(planet, pName) {
        planets[pName] = new Planet(planet);
      });

      
      loaded = true;
      if(done != null){
        done();
      }
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
  
  Map.prototype.drawFPS = function(){
    this.fpsLabel = new Text("-- fps","bold 14px Arial","#FFF");
  	stage.addChild(this.fpsLabel);
  	this.fpsLabel.x = 300;
  	this.fpsLabel.y = 300;
  }
  
  Map.prototype.updateFPS = function(){
    this.fpsLabel.text = Math.round( Ticker.getMeasuredFPS() )+ " fps";
    this.fpsLabel.x = -stage.x + 10;
    this.fpsLabel.y = -stage.y + 15;
  }
  
  Map.prototype.registerMapControls = function(){
    var scroll_listener;
    var me = this;
    
    canvas.addEventListener("mousedown", function(evt){
      if(typeof minimap != "undefined"){
        if(minimap.mouseOver()){
          minimap.onMouse(evt);
        }
      }
    
      var off_x = evt.offsetX;
      var off_y = evt.offsetY;
    
      var st = {
        x: stage.x,
        y: stage.y
      }
    
      scroll_listener = function(e){
        if(typeof minimap != "undefined"){
          if(minimap.mouseOver()){
            minimap.onMouse(e);
            return;
          }
        }
        me.dragged = true;
        var newCoords = {
          x: st.x - (off_x - e.offsetX),
          y: st.y - (off_y - e.offsetY)
        }
    
        // OOB Checks: Top-Left
        if(newCoords.x < 0){
          stage.x = newCoords.x;
        }
        if(newCoords.y < 0){
          stage.y = newCoords.y;
        }
        
        // OOB Checks: Bottom-Right
        if(newCoords.x < canvas.width-me.dim.width){
          stage.x = canvas.width-me.dim.width;
        }
        if(newCoords.y < canvas.height-me.dim.height){
          stage.y = canvas.height-me.dim.height;
        }
        
        if(typeof minimap != "undefined"){
          minimap.updatePos();
        }
      }
      document.addEventListener("mousemove", scroll_listener, false); 
    }, false);
    
    document.addEventListener("mouseup", function(evt){
      document.removeEventListener("mousemove",scroll_listener, false);
    }, false);
  }
  
  Map.prototype.drawLabels = function(){
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

    //drawLabels();
  }
  
  // Register for everyone
  w.Map = Map;
  
})(window);
