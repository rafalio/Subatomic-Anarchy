var Forms   = require('forms')
  , forms   = require('../models/forms.js')
  , models  = require('../models/models.js')
  , auth    = require('../auth.js')
  , sys     = require('sys');
  
require('./mail.js');

function register(req,res) {
  forms.register_form.handle(req, {
      success : function(form){
        var data = form.data;
        
        auth.registerUser(data, function(result){
          simpleWrite(res,result);
        })
        
      },
      other : function(form){
        simpleWrite(res,"You filled out the form wrong! Try again! ");
      }
  });
}

function login_register_f(req,res) {
  res.render('login', {
    title: 'Awesome Web Game 3.0 | Login',
    login_form: forms.login_form.toHTML(Forms.render.p),
    register_form: forms.register_form.toHTML(Forms.render.p)
  });
}

function login(req,res) {
  console.log(sys.inspect(req.body));  

	forms.login_form.handle(req, {
	    success: function(form){
          var data = form.data;
          
          auth.authUser(data, function(user){
            if(!user){
              simpleWrite(res,"Authentication failed. Check username/password");
            }
            else{
              simpleWrite(res,"Authentication succesfull!");
              req.session.user = user;
            }
          })
	    },
	    other : function(form){
	        simpleWrite(res,"There was an error with the form, please check it! ");
	    }
	});
}

function logout(req,res){
  delete req.session.user;
  res.redirect('/login');
} 

exports.login_register_f = login_register_f;
exports.login = login;
exports.register = register;
exports.logout = logout;