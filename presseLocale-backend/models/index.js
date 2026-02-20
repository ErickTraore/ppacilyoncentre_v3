const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'config', 'config.js'))[env];
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host || 'mariadb', port: config.port || 3306, dialect: config.dialect || 'mariadb', logging: false,
});
const PresseLocale = require('./presseLocale')(sequelize, DataTypes);
module.exports = { sequelize, Message: PresseLocale, PresseLocale };
