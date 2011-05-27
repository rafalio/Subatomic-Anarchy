var dbconfig = {
  table: "game",
  user: "root",
  pass: "dupa"
}

Sequelize = require("sequelize")
chainer = new Sequelize.Utils.QueryChainer
sequelize = new Sequelize(dbconfig.table, dbconfig.user, dbconfig.pass , { logging: true });