require('./db.js');

var User = sequelize.define('User',{
	username: {
	  type: Sequelize.STRING,
	  allowNull: false,
	  unique: true,
	  primaryKey: true
  },
  
	password: {
	  type: Sequelize.STRING,
	  allowNull: false
	},
	
	email: { 
	  type: Sequelize.STRING,
	  allowNull: false 
	}
});

exports.User = User;




