var dbconfig = {
  db: "game",
  user: "root",
  pass: "root"
}

Sequelize = require("sequelize");
chainer = new Sequelize.Utils.QueryChainer;
sequelize = new Sequelize(dbconfig.db, dbconfig.user, dbconfig.pass , { logging: true });