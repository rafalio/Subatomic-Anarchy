var auth;
var Forms = require('forms');
var login_form;
var register_form;
var User;
var Player;
var data = require('../data.js');

function start(auth_, login_form_, register_form_, User_, Player_) {
  auth = auth_;
  login_form = login_form_;
  register_form = register_form_
  User = User_;
  Player = Player_;
}

function register(req,res) {
  register_form.handle(req, {
      success: function(form) {
        auth.registerUser(form.data, function(result) {
          if(result == 'registered') {
            res.send({
              success: 'Registration successfull.'
            });
          } else if(result == 'taken') {
            res.send({
              error: 'Username is already taken, choose a different one.'
            });
          } else {
            res.send({
              error: 'We have some internal issues. Please do something else while we figure out what\'s wrong.'
            });
          }
        });
      },
      other: function(form){
        res.send({
          error: 'You have filled out the form wrong. Try again!'
        });
      }
  });
}

function login(req,res) {
  login_form.handle(req, {
    success: function(form) {
      auth.authUser(form.data, function(err,user) {
        if(!err) {
          res.send({
            success: "Authentication succesfull."
          });
          var user = new Player.Player(user);
          data.users[user.getName()] = user;
          req.session.username = user.getName();
        } else if (err == 'user' || err == 'match') {
          res.send({
            error: "Wrong username/password"
          });
        } else {
          res.send({
            error: "We have some internal issues. Please do something else while we figure out what\'s wrong."
          });
        }
      });
    },
    other: function(form) {
      res.send({
        error: "There was something wrong with the form. Please try again."
      });
    }
  });
}

function logout(req,res) {
  delete req.user;
  delete data.users[req.session.username];
  req.session.destroy(function(){});
  res.redirect('home');
}

function login_register_f(req,res) {
  res.render('login', {
    head: 'login_head',
    title: 'Login/Register',
    login_form: login_form.toHTML(Forms.render.p),
    register_form: register_form.toHTML(Forms.render.p),
    flash: req.flash()
  });
}

exports.start = start;
exports.login_register_f = login_register_f;
exports.login = login;
exports.register = register;
exports.logout = logout;

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};
