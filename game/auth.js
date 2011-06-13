var bcrypt = require('bcrypt');
var User;

exports.start = function(User_) {
  User = User_;
}


// Callback function fo type function(err,user)
// Possible err include
// - Errors from random crap when we just say error try again later when 
//   we try to fix it
// - 'user' when user doesn't exist and 'match' when passwords don't match,
//   anyway try again 
// - null when user has the user data inside.
exports.authUser = function(data, cb) {
  User.findOne({username: data.username}, function(err, user) {
    if(err) {
      console.log("Error: DB find");
      cb(err,null);
    } else if(!user) {
      console.log("Error: User doesn't exist");
      cb('user', null)
    } else {
      bcrypt.compare(data.password, user.password, function(err,res) {
        if(err) {
          console.log("Error: Couldn't generate hash");
          cb(err, null);
        } else if (!res) {
          console.log("Error: Passwords don't match");
          cb('match', null);
        } else {
          console.log(user);
          cb(null, user);
        }
      });
    }
  });
}

//Callback function of type function(res)
//Possible results:
// - Errors from random crap when we just say error try again later when 
//   we try to fix it
// - 'taken', when we say choose a different username
// - 'registered', which means it worked 
exports.registerUser = function(data, cb) {
  User.findOne( {username: data.username}, function(err, res) {
    if(err) {
      console.log("Error: DB find");
      cb(err);
    } else if(res != null) {
      console.log("Error: Tried to register existing user");
      cb('taken');
    } else {
      bcrypt.gen_salt(10, function(err,salt) {
        if(err) {
          console.log("Error: Couldn't generate salt");
          cb(err);
        } else {
          bcrypt.encrypt(data.password, salt, function(err, hash) {
            if(err) {
              console.log("Error: Couldn't generate hash");
              cb(err);
            }
            var new_user = new User({
              username: data.username,
              email: data.email,
              password: hash
            });
            new_user.save(function(err){
              if(err) {
                console.log("Error: when saving to DB");
                cb(err)
              } else {
                cb('registered');
              }
            });
          });
        }
      });
    }
  });
}