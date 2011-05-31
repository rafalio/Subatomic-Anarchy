var models = require('./models/models.js')
  , bcrypt = require('bcrypt')
  , salt1 = "3200";
  
require('./controllers/mail.js');

exports.authUser = function(data, callback){
  models.User.findOne({username: data.username}, function(err, user){
    if(err){
      console.log("DB error...");
      callback(null);
    } else if (!user) {
      callback(null);
    } else {
      bcrypt.gen_salt(10, function(err, salt) {
        bcrypt.encrypt(data.password, salt1, function(err, hash){
          if(user.password != hash) callback(null);
          else callback(user);
        });
      });
    }});
}


exports.registerUser = function(data, callback){
  models.User.findOne( {username: data.username}, function(err, result) {
    if(err) {
      console.log("DB Error occured");
      callback("fail: " + err);
    } else if(result != null) {
      callback('Sorry, that username is already taken! Please select a different username!');
    } else {
      bcrypt.gen_salt(10, function(err, salt) {
        if(err)
          callback("fail: " + err);
        else
          bcrypt.encrypt(data.password, salt1, function(err, hash) {
            data.password = hash;
            var new_user = new models.User(data);
            // Note: I belive the 'err' over here does strictly originate as a DB saving error. It's an error
            // that we can define and propagate through middleware. Although probably, it could also come
            // from the database saving layer.
            new_user.save(function(err){
              if(!err){
                callback("Registration succesful! A confirmation email has been sent to you!");
              }
              else {
                callback("fail: " + err);
              }
            });
          });
      });
    }
  });
}