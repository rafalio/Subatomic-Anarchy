var lr    = require('./loginregisterh.js');
var msg   = require('./messaging.js');
var admin = require('./admin.js');
var models = require('../models/models');
var data = require('../data.js');

// Routing information:
// First comes the path, then the array of functions, starting with 
// the middlewares, followed by the final handling function

var routes = {
  post : {
    '/login' : [lr.login],
    '/register' : [lr.register],
    '/sendMessage' : [msg.sendMessage]
  },
  get : {
    '/' : [requireLogin, lr.index],
    '/login' : [loggedIn, lr.login_register_f],
    '/logout' : [writeData, lr.logout],
    '/admin' : [requireAdmin, admin.admin],
    '/inbox' : [requireLogin, msg.inbox]
  }
}

// Routing functions

var funcs = {
  post : app.post,
  get : app.get,
  all : app.all
}

// Call the appropriate methods...

Object.keys(routes).forEach( function(type, index, array) {
  var func = funcs[type];
  Object.keys(routes[type]).forEach( function(path, index1, array1){
    var args = routes[type][path];
    args.unshift(path);
    func.apply(app,args);
  })
})



// If the user is logged in, redirect to home
// Use for places which require person to be NOT logged in.

function loggedIn(req,res,next){
  if(req.session.user) res.redirect('/');
  else next();
}

// If user is not logged in, redirect to login page

function requireLogin(req,res,next){
  if(req.session.user) next();
  else res.redirect('/login');
}

// If user is not an admin, redirect to home page

function requireAdmin(req,res,next){
  var u = req.session.user;
  if(u && u.admin) next();
  else res.redirect('/');
}


// Writes player data back to backing store
function writeData(req,res,next){
  models.User.findById(req.session.user._id, function(err, user){
    var p = data.players[user.username];
    user.position = p.position;
  })
  next();
}
