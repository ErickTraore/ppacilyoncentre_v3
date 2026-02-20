// Test liaison BDD presseLocale-backend (charge .env.production puis authenticate)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });
process.env.NODE_ENV = 'production';

const config = require('./config/config.js').production;
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host || '127.0.0.1',
  port: config.port || 3306,
  dialect: config.dialect || 'mariadb',
  logging: false,
});

sequelize.authenticate()
  .then(() => {
    console.log('presseLocale-backend: liaison BDD OK');
    process.exit(0);
  })
  .catch((err) => {
    console.error('presseLocale-backend: liaison BDD KO', err.message);
    process.exit(1);
  });
