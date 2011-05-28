var lr = require('./loginregisterh.js');

// Routing information

var routes = {
  post : {
    '/login' : [lr.login],
    '/register' : [lr.register],
  },
  get : {
    '/' : [requireLogin, lr.index],
    '/login' : [loggedIn, lr.login_register_f],
    '/logout' : [lr.logout],
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
  if(req.session.user){
    res.redirect('/');
  }
  else{
    next();
  }
}

function requireLogin(req,res,next){
  if(req.session.user){
    next();
  }
  else{
    res.redirect('/login');
  }
}