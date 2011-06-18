require('./db.js');

var resources = {
  deuterium: {type: Number, min:0, default: 100},
  food:      {type: Number, min:0, default: 100},
  gold:      {type: Number, min:0, default: 100}
}

var UserSchema = new Schema({
  username: {type: String, unique: true},
  password: String,
  email: String,
  joined: {type: Date, default: Date.now},
  admin: {type: Boolean, default: false},
  position: {
    x: {type: Number, default: 3},
    y: {type: Number, default: 3}
  },
  rotation: {type: Number, default: 0},
  shipType: {type: Number, default: 1},
  resources: resources,
  capacity: {type: Number, min: 0, default: 500}
});

mongoose.model('User', UserSchema);

/*
Due to some immense stupidity, only collections of Schemas are allowed as types in Mongoose.
This is discussed a bit here: https://github.com/LearnBoost/mongoose/issues/188

What this means, is that any type of has-a relationship that's one-to-one will have to be done
using ObjectId. Why this is the case, is beyond me....
*/

var MessageSchema = new Schema({
  from: ObjectId,
  to: ObjectId,
  date: {type: Date, default: Date.now},
  read: {type: Boolean, default: false},
  content: String
});

mongoose.model('Message', MessageSchema);

var PlanetSchema = new Schema({
  name: {type: String, unique: true},
  position:{
    x: Number,
    y: Number
  },
  size: String,
  kind: String,
  resources: resources,
  src: String,
  size: {type: String, default: "small"}
});

mongoose.model('Planet', PlanetSchema);

exports.User    = mongoose.model('User');
exports.Message = mongoose.model('Message');
exports.Planet  = mongoose.model('Planet');
