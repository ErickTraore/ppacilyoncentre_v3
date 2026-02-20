// Test liaison BDD user-backend (charge .env.production puis authenticate)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });
process.env.NODE_ENV = 'production';

const config = require('./config/config.js').production;
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host || '127.0.0.1',
  dialect: config.dialect || 'mysql',
  logging: false,
});

sequelize.authenticate()
  .then(() => {
    console.log('user-backend: liaison BDD OK');
    process.exit(0);
  })
  .catch((err) => {
    console.error('user-backend: liaison BDD KO', err.message);
    process.exit(1);
  });
