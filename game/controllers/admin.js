var _ = require('underscore');
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
  console.log(req.body);
  var map = req.body.map;
  console.log(map);
  models.Planet.remove({},function(){
    console.log("planet removal succesful");
    console.log("adding planets again....");
    populateDB(map);
    res.send("Seems to have been succesful!");
  })
}

function populateDB(planets){
  _.forEach(planets, function(e){
    var p = new models.Planet(e);
    p.save(function(err){
      console.log("Adding planet " + e.name + " to database! ");
    });
  });
}

function mapEdit(req,res) {
  res.render('mapEdit', {
    layout: 'mapEdit_layout',
    title: 'Map Editor'
  });
}

exports.start = start;
exports.admin = admin;
exports.clearPlanets = clearPlanets;
exports.mapEdit = mapEdit;
