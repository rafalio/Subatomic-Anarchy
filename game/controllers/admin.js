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

function mapgen(req,res) {
  res.render('mapgen', {
    title: 'Map Generator'
  });
}

exports.start = start;
exports.admin = admin;