var models;

function start(models_){
  models = models_;
}

function admin(req,res) {
  models.User.find({}, function(err, result){
    var send = 'error';
    if(!err)
      send = result;
    res.render('admin', {
      head: 'admin_head',
      title: 'Admin Panel',
      users: send
    });
  });
}

function clearPlanets(req,res){
  models.Planet.remove({},function(){
    console.log("planet removal succesful");
    console.log("adding planets again....");
    populateDB(simple_map);
    res.redirect('/admin');
  })
}

// Simple map that the map editor should output!

var simple_map = {
  "betelgeuse" : {
    name: "betelgeuse",
    position: {
      x: 4,
      y: 5
    },
    kind: "agricultural",
    resources: {
      deuterium: 598352,
      gold: 23583,
      food: 325883,
    },
    src: "planet1.png"
  },
  "awesome" : {
    name: "awesome",
    position: {
      x: 6,
      y: 3
    },
    kind: "agricultural",
    resources: {
      deuterium: 59835332,
      gold: 23585343,
      food: 323455883,
    },
    src: "planet1.png"
  }
}

function populateDB(planets){  
  Object.keys(planets).forEach(function(e){
    var p = new models.Planet(planets[e]);
    p.save(function(err){
      console.log("Adding planet " + e + " to database! ");
    })
  })
}

function mapgen(req,res) {
  res.render('mapgen', {
    title: 'Map Generator'
  });
}

exports.start = start;
exports.admin = admin;
exports.clearPlanets = clearPlanets;