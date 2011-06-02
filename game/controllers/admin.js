var models  = require('../models/models.js')

function admin(req,res){
  models.User.find({}, function(err, result){
    res.render('admin', {
      title: 'Admin Panel',
      users: result
    })
  })
}

exports.admin = admin;