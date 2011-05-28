var Forms = require('forms')
  , forms = require('../models/forms.js')
  , models = require('../models/models.js')
  , sys = require('sys');
  
require('./mail.js');

function index(req,res) {
  if(!req.session.user)
    simpleWrite(res, "You're not logged in!");
  else
    simpleWrite(res, "You're logged in as " + req.session.user.username);
}

function register(req,res) {
  console.log("Trying to register...");
  
  forms.register_form.handle(req, {
      success : function(form){
        var data = form.data;
        console.log(data);    

        models.User.count({
          where : {
            username : data.username
          }
        }).on("success", function(count){
          if(count > 0){
            simpleWrite(res,"Sorry, that username is already taken! Please select a different username!");
          }
          else{
            var new_user = models.User.build(data);
            new_user.save().on('success', function(){
              email(data.email,
                    "Thanks for registering with our awesome game!",
                    "Thanks for registering with our awesome game!",
                    function(error,success){
                      if(error)
                        simpleWrite(res,"Registration succesful! But unfortunately the email server broke.");
                      else
                        simpleWrite(res,"Registration succesful! A confirmation email has been sent to you!");
                    });
            });
          }
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
          
          models.User.find({ where: {username : data.username}}).on("success",function(user){
            if(!user){
              simpleWrite(res,"No user with that username found!");
            }
            else if(user.password == data.password){
              req.session.user = fetchAttributes(user);
              simpleWrite(res,"Authentication succesfull!");
            }
            else{
              simpleWrite(res,"Authentication failed, passwords don't match!");
            }
          })
	    },
	    other : function(form){
	        simpleWrite(res,"There was an error with the form, please check it! ");
	    }
	});
}

exports.index = index;
exports.login_register_f = login_register_f;
exports.login = login;
exports.register = register;