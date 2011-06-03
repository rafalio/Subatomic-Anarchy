exports.index = function(req,res) {
  res.render('game', {
    layout: 'game_layout',
    title: "Welcome to our awesome game!",
  });
}