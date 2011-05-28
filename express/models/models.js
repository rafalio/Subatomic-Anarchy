require('./db.js');

var User = new Schema({
  username: {type: String, unique: true},
  password: String,
  email: String,
  joined: {type: Date, default: Date.now}
})

mongoose.model('User', User);

exports.User = mongoose.model('User');