var data = require('../data.js')
var Forms = require('forms')
var forms = require('../models/forms.js');



exports.game = function(req,res) {
  // Add to session before starting the rendering so that I can access
  // 'me' from the dynamic helpers
  
  res.render('game', {
    layout: 'game_layout',
    title: "Welcome to our Awesome Game!",
    message_form: forms.message_form.toHTML(Forms.render.p),
  });
}

