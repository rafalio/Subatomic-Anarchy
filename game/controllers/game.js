var data = require('../data.js')

exports.game = function(req,res) {
  // Add to session before starting the rendering so that I can access
  // 'me' from the dynamic helpers
  
  var uname = req.session.user.username;

  if(! data.players[uname]){
    console.log("adding {0} to session".format(uname))
    data.players[uname] = req.session.user;
  }
  
  
  res.render('game', {
    layout: 'game_layout',
    title: "Welcome to our awesome game!",
  });
}