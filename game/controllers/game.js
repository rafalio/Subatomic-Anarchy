exports.index = function(req,res) {
  res.render('game', {
    head: 'game_head',
    title: "Welcome to our awesome game!",
  });
}