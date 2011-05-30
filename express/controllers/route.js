var lr    = require('./loginregisterh.js');
var admin = require('./admin.js');

// Routing information:
// First comes the path, then the array of functions, starting with 
// the middlewares, followed by the final handling function

var routes = {
  post : {
    '/login' : [lr.login],
    '/register' : [lr.register],
  },
  get : {
    '/' : [requireLogin, lr.index],
    '/login' : [loggedIn, lr.login_register_f],
    '/logout' : [lr.logout],
    '/admin' : [requireAdmin, admin.admin]
  }
}

// Routing functions

var funcs = {
  post : app.post,
  get : app.get
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


function loggedIn(req,res,next){
  if(req.session.user) res.redirect('/');
  else next();
}

function requireLogin(req,res,next){
  if(req.session.user) next();
  else res.redirect('/login');
}

function requireAdmin(req,res,next){
  var u = req.session.user;
  if(u && u.admin) next();
  else res.redirect('/');
}
