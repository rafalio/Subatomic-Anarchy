var admin = require('./admin.js');
var game  = require('./game.js');
var lr    = require('./loginregisterh.js');
var msg   = require('./messaging.js');

// Routing information:
// First comes the path, then the array of functions, starting with 
// the middlewares, followed by the final handling function

exports.start = function(app,auth,data,forms,models,player) {
  lr.start(auth, forms.login_form, forms.register_form, models.User, player);
  admin.start(models);
  msg.start(forms, models, data);
  var routes = {
    post : {
      '/login'              : [getUser, lr.login],
      '/register'           : [getUser, lr.register],
      '/sendMessage'        : [getUser, requireLogin, msg.sendMessage],
      '/admin/clearPlanets' : [getUser, requireLogin, admin.clearPlanets],
      '/getMessage' : [getUser, requireLogin, msg.getMessage],
      '/getNewMessages' : [getUser, requireLogin, msg.getNewMessages],
      '/buy' : [getUser, requireLogin, game.buy]
    }, 

    get : {
      '/' : [getUser, index],
      '/game' : [getUser, requireLogin, noMultipleLogins, accessLogger, game.game],
      '/login' : [getUser, loggedIn, lr.login_register_f],
      '/logout' : [getUser, requireLogin, lr.logout],
      '/admin' : [getUser, requireLogin, requireAdmin, accessLogger, admin.admin],
      '/mapEdit' : [getUser, requireLogin, requireAdmin, accessLogger, admin.mapEdit],
      '/inbox' : [getUser, requireLogin, accessLogger, msg.inbox],
      '/getUsernames' : [getUser, msg.getUsernames],
      '/getMessages': [getUser, msg.getMessages],
      '/getPrices' : [getUser, requireLogin, game.getPrices],
      '/getMessage'         : [getUser, requireLogin, msg.getMessage],
      '/getNewMessages'     : [getUser, requireLogin, msg.getNewMessages],
      '/getUnread'          : [getUser, msg.getUnread]
    }, 

    
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
    });
  });
  
  function index(req,res) {
    if(req.user)
      res.redirect('/game');
    else
      res.redirect('/login');
  }


  // MIDDLEWARE

  // If the user is logged in, redirect to home
  // Use for places which require person to be NOT logged in.
  function loggedIn(req,res,next){
    if(req.user) res.redirect('home');
    else next();
  }
  
  // Do not allow multiple game screens per person. Only one!
  function noMultipleLogins(req,res,next){
    var uname = req.user.getName();
    if(data.players[uname])
      res.send("Sorry, no multiple accesses are allowed.");
    else
      next();
  }

  // If user is not logged in, redirect to login page
  function requireLogin(req,res,next){
    if(req.user) {
      next();
    } else {
      req.flash('error', 'You have to login!');
      res.redirect('/login');
    }
  }

  // If user is not an admin, redirect to home page
  function requireAdmin(req,res,next){
    if(req.user.getAdmin()) {
      next();
    } else {
      req.flash('error', 'You don\'t have sufficient privileges to access the site');
      res.redirect('back');
    }
  }

  // Logs access to site after logging in
  function accessLogger(req, res, next) {
    console.log('Restricted part %s accessed by %s', req.originalUrl, req.user.getName());
    next();
  }
  
  function getUser(req, res, next) {
    if (req.session.username)
      req.user = data.users[req.session.username];
    next();
  }
}
