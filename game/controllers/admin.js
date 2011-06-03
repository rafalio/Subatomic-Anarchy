var models  = require('../models/models.js')

function admin(req,res){
  models.User.find({}, function(err, result){
    res.render('admin', {
      title: 'Admin Panel',
      users: result
    });
  });
}

function mapgen(req,res){
  res.render('mapgen', {
    title: 'Map Generator'
  });
}

exports.admin = admin;