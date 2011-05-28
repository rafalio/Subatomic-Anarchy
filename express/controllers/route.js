var lr = require('./loginregisterh.js');

app.get('/', requireLogin, lr.index);

app.get('/login', loggedIn, lr.login_register_f);
app.post('/login', lr.login);
app.post('/register', lr.register);

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